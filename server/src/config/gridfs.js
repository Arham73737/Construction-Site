import dotenv from 'dotenv';
dotenv.config();

import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';

export const makeGridFsStorage = () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("❌ MONGO_URI is not defined in .env");
  }

  const storage = new GridFsStorage({
    url: mongoUri,
    file: (req, file) => ({
      bucketName: 'uploads',
      filename: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
    })
  });

  return multer({ storage });
};
