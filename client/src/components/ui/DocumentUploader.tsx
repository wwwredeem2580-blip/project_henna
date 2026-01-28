'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mediaService } from '@/lib/api/media';

interface DocumentUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  maxSizeMB = 5,
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Accepted: PDF, JPG, PNG';
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    return null;
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: FileWithProgress[] = [];
    for (const file of selectedFiles) {
      const error = validateFile(file);
      if (error) {
        onUploadError?.(error);
        continue;
      }

      newFiles.push({
        file,
        progress: 0,
        status: 'pending',
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Update all files to uploading status
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      // Upload all files
      const filesToUpload = files.map(f => f.file);
      const response = await mediaService.uploadDocuments(filesToUpload);

      // Update files with success status and URLs
      setFiles(prev => prev.map((f, i) => ({
        ...f,
        status: 'success',
        progress: 100,
        url: response.urls[i],
      })));

      // Call success callback
      onUploadComplete(response.urls);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Upload failed. Please try again.';
      
      // Update files with error status
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'error',
        error: errorMessage,
      })));

      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const allSuccess = files.length > 0 && files.every(f => f.status === 'success');

  return (
    <div className="w-full space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      {!allSuccess && (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`p-8 border-2 border-dashed rounded-2xl bg-gray-50 flex flex-col items-center justify-center gap-4 transition-all ${
            isUploading
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:border-brand-300 group'
          } border-gray-200`}
        >
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-brand-600 transition-colors">
            <Upload size={24} />
          </div>
          <div className="text-center">
            <p className="font-[500] text-neutral-800">Upload Verification Documents</p>
            <p className="text-sm text-neutral-500">PDF, JPG or PNG (Max {maxSizeMB}MB each)</p>
            <p className="text-xs text-neutral-400 mt-1">
              Maximum {maxFiles} files • {files.length}/{maxFiles} selected
            </p>
          </div>
        </div>
      )}

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {files.map((fileItem, index) => {
              const icon = getFileIcon(fileItem.file);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    fileItem.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : fileItem.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    {icon ? (
                      <img src={icon} alt={fileItem.file.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileText size={20} className="text-slate-500" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-[500] text-slate-700 truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                    {fileItem.status === 'error' && fileItem.error && (
                      <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {fileItem.status === 'uploading' ? (
                      <Loader2 size={20} className="text-brand-500 animate-spin" />
                    ) : fileItem.status === 'success' ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : fileItem.status === 'error' ? (
                      <AlertCircle size={20} className="text-red-500" />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                        disabled={isUploading}
                      >
                        <X size={16} className="text-slate-500" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {files.length > 0 && !allSuccess && (
        <button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className="w-full bg-brand-500 text-white font-[600] py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Uploading {files.length} {files.length === 1 ? 'file' : 'files'}...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload {files.length} {files.length === 1 ? 'file' : 'files'}
            </>
          )}
        </button>
      )}

      {/* Success State */}
      {allSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-[500] text-green-800">
              {files.length} {files.length === 1 ? 'document' : 'documents'} uploaded successfully
            </p>
          </div>
          <button
            onClick={() => setFiles([])}
            className="text-xs text-green-600 hover:underline"
          >
            Upload More
          </button>
        </div>
      )}
    </div>
  );
};
