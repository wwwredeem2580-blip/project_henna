import { Router } from 'express';
import { getImageKitAuth, trackImageKitUpload, getUserUploads } from './imagekit/service';
import { requireAuth } from '../../middlewares/auth';
import multer from 'multer';
import { uploadToBackblaze, deleteFromBackblaze } from './backblaze/service';
// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5 // Max 5 files per request
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow only specific file types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'));
    }
  }
});

const router = Router();

router.get('/imagekit/auth', requireAuth, getImageKitAuth);
router.post('/imagekit/track', requireAuth, trackImageKitUpload);
router.get('/imagekit/uploads', requireAuth, getUserUploads);

router.post('/backblaze/upload', requireAuth, upload.array('documents', 5), uploadToBackblaze);
router.delete('/backblaze/delete', requireAuth, deleteFromBackblaze);


export default router;
