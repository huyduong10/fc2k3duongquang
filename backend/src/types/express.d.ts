import type { Types } from 'mongoose';
import type { AdminDocument } from '../models/Admin.js';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminDocument & { _id: Types.ObjectId };
    }
  }
}

export {};
