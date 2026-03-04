'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mediaService } from '@/lib/api/media';
import ImageKit from 'imagekit-javascript';

interface ImageUploaderProps {
  type: string; // 'event_cover', 'profile_picture', etc.
  onUploadComplete: (url: string, fileId: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  currentImage?: string;
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  type,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png'],
  currentImage,
}) => {
  const [state, setState] = useState<UploadState>(currentImage ? 'success' : 'idle');
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file type. Accepted formats: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    return null;
  };

  const handleUpload = async (file: File) => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setState('error');
      onUploadError?.(validationError);
      return;
    }

    setState('uploading');
    setProgress(0);
    setError('');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Get ImageKit auth from backend
      const auth = await mediaService.getImageKitAuth();

      // Initialize ImageKit
      const imagekit = new ImageKit({
        publicKey: auth.publicKey,
        urlEndpoint: auth.urlEndpoint,
      });

      // Upload to ImageKit with promise-based approach
      const uploadResponse: any = await new Promise((resolve, reject) => {
        imagekit.upload({
          file: file,
          fileName: `${type}_${Date.now()}_${file.name}`,
          folder: `/zenvy/${type}`,
          useUniqueFileName: true,
          tags: [type],
          signature: auth.signature,
          expire: auth.expire,
          token: auth.token,
        }, (err: any, result: any) => {
          if (err) {
            console.error('ImageKit upload error:', err);
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });

      if (!uploadResponse) {
        throw new Error('Upload failed - no response from ImageKit');
      }

      // Track upload in backend
      await mediaService.trackImageKitUpload({
        fileId: uploadResponse.fileId,
        url: uploadResponse.url,
        filename: uploadResponse.name,
        type,
        status: 'permanent',
      });

      // Success
      setState('success');
      setProgress(100);
      onUploadComplete(uploadResponse.url, uploadResponse.fileId);
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      setState('error');
      onUploadError?.(errorMessage);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState('dragging');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState(preview ? 'success' : 'idle');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState('idle');

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleClick = () => {
    if (state !== 'uploading') {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setState('idle');
    setProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {state === 'success' && preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <div className="relative aspect-video rounded-none overflow-hidden border border-gray-300">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={handleClick}
                    className="px-4 py-2 bg-white text-wix-text-dark border border-gray-300 text-[13px] font-medium hover:border-black transition-all"
                  >
                    Replace
                  </button>
                  <button
                    onClick={handleRemove}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-[13px] font-medium hover:bg-red-100 transition-all font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-green-500 text-white p-1.5 rounded-full shadow-md">
                <Check size={14} strokeWidth={3} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-10 border border-dashed rounded-none flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${
              state === 'dragging'
                ? 'border-wix-text-dark bg-gray-50'
                : state === 'error'
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-white hover:border-wix-text-dark'
            }`}
          >
            <div
              className={`w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center transition-all ${
                state === 'uploading'
                  ? 'text-wix-purple'
                  : state === 'error'
                  ? 'text-red-500'
                  : 'text-gray-400 group-hover:text-wix-text-dark'
              }`}
            >
              {state === 'uploading' ? (
                <Loader2 size={24} className="animate-spin" />
              ) : state === 'error' ? (
                <AlertCircle size={24} />
              ) : state === 'dragging' ? (
                <ImageIcon size={24} className="text-wix-text-dark" />
              ) : (
                <Upload size={24} />
              )}
            </div>

            <div className="text-center">
              {state === 'uploading' ? (
                <>
                  <p className="font-[500] text-neutral-800">Uploading...</p>
                  <div className="w-48 h-1.5 bg-gray-100 mt-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-wix-text-dark"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{progress}%</p>
                </>
              ) : state === 'error' ? (
                <>
                  <p className="font-[500] text-red-600">Upload Failed</p>
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setState('idle');
                      setError('');
                    }}
                    className="mt-2 text-[13px] font-medium text-wix-text-dark hover:underline"
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <p className="font-[500] text-neutral-800">
                    {state === 'dragging' ? 'Drop image here' : 'Upload Event Cover Image'}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(' or ')} (Max {maxSizeMB}MB)
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Click to browse or drag and drop
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
