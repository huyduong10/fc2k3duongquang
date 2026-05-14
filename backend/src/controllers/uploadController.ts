import type { Request, Response } from 'express';
import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'Image file is required' });
    return;
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    res.status(500).json({ message: 'Cloudinary is not configured' });
    return;
  }

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'football-dashboard' },
      (error, uploaded) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(uploaded as { secure_url: string; public_id: string });
      },
    );

    stream.end(req.file?.buffer);
  });

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id,
  });
});
