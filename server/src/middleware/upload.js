// upload.js
import multer from 'multer';

// Use memory storage instead of GridFS storage
export const upload = multer({ storage: multer.memoryStorage() });
