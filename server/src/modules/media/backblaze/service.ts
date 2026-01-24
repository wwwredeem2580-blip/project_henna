import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Media } from '../../../database/media/media';
import { Request, Response } from 'express';
import { handleError } from '../../../utils/handleError';
import CustomError from '../../../utils/CustomError';

// Initialize Backblaze S3 Client
const s3Client = new S3Client({
  region: 'eu-central-003',  // Backblaze region
  endpoint: process.env.BACKBLAZE_ENDPOINT!,  // e.g., s3.us-west-000.backblazeb2.com
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_APP_KEY!
  }
});

export const uploadToBackblaze = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new CustomError('No files uploaded', 400);
    }
    const documentType = req.body.documentType || '';
    const userId = req.user?.sub;

    const uploadedFiles = await Promise.all(files.map(async file => {
      // Generate unique object key with filename and type embedded
      const timestamp = Date.now();
      const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const objectKey = `users/${userId}/events/temp/${timestamp}-${sanitizedFilename}`;

      // Upload file to Backblaze
      const command = new PutObjectCommand({
        Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype
      });

      await s3Client.send(command);

      // Track in database
      const upload = await Media.create({
        userId,
        type: documentType,
        provider: 'backblaze',
        status: 'temp',
        objectKey,
        filename: file.originalname,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        bucketName: process.env.BACKBLAZE_BUCKET_NAME!
      });

      return { objectKey, filename: file.originalname, uploadedAt: upload.uploadedAt };
    }));

    return res.status(200).json({ success: true, files: uploadedFiles });
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteFromBackblaze = async (req: Request, res: Response) => {
  try {
    const { objectKey } = req.body;
    const userId = req.user?.sub;

    if (!objectKey) {
      throw new CustomError('Object key is required', 400);
    }

    // Delete file from Backblaze
    const command = new DeleteObjectCommand({
      Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
      Key: objectKey
    });

    await s3Client.send(command);

    // Mark as deleted in database
    await Media.updateOne(
      { userId, objectKey },
      { 
        status: 'deleted', 
        deletedAt: new Date() 
      }
    );

    return res.status(200).json({ success: true, objectKey });
  } catch (error) {
    handleError(error, res);
  }
};
