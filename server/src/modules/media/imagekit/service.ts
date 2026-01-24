import ImageKit from 'imagekit';
import { Media } from '../../../database/media/media';
import dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { handleError } from '../../../utils/handleError';
import { imageKitTrackSchema } from '../../../schema/media.schema';


const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export const getImageKitAuth = async (req: Request, res: Response) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    return res.status(200).json({
      token: authParams.token,
      expire: authParams.expire,
      signature: authParams.signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const trackImageKitUpload = async (req: Request, res: Response) => {
  try {
    const data = imageKitTrackSchema.parse(req.body);

    const { fileId, url, filename, type, status } = data;

    // Extract file extension from filename or URL for mimeType
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    const mimeType = getMimeTypeFromExtension(fileExtension);

    // Check if upload already exists
    const existingUpload = await Media.findOne({ fileId });
    if (existingUpload) {
      // Update existing record
      await Media.updateOne(
        { fileId },
        {
          url,
          filename,
          type,
          status,
          mimeType,
          updatedAt: new Date()
        }
      );
    } else {
      // Check for existing uploads of the same type and user (to replace old images)
      const oldUploads = await Media.find({
        userId: req.user?.sub,
        type,
        provider: 'imagekit',
        status: { $ne: 'deleted' }
      });

      // Delete old images from ImageKit and mark as deleted in DB
      for (const oldUpload of oldUploads) {
        try {
          if (oldUpload.fileId) {
            await imagekit.deleteFile(oldUpload.fileId);
            console.log(`Deleted old image from ImageKit: ${oldUpload.fileId}`);
          }
          await Media.updateOne(
            { _id: oldUpload._id },
            { status: 'deleted', deletedAt: new Date() }
          );
        } catch (error) {
          console.error(`Failed to delete old image ${oldUpload.fileId}:`, error);
        }
      }

      // Create new record
      await Media.create({
        userId: req.user?.sub,
        type,
        provider: 'imagekit',
        status,
        fileId,
        url,
        filename,
        mimeType,
        uploadedAt: new Date(),
        expiresAt: status === 'temp' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
      });
    }

    return res.status(200).json({ success: true, fileId });
  } catch (error) {
    handleError(error, res);
  }
};

export const getUserUploads = async (req: Request, res: Response) => {
  try {
    const query: any = {
      userId: req.user?.sub,
      provider: 'imagekit',
      status: { $ne: 'deleted' }
    };

    if (req.query.type) {
      query.type = req.query.type;
    }

    const uploads = await Media.find(query).sort({ uploadedAt: -1 });
    return res.status(200).json({ success: true, uploads });
  } catch (error) {
    handleError(error, res);
  }
};

// Helper function to get MIME type from file extension
function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  return mimeTypes[extension] || 'application/octet-stream';
}
