import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'football-dashboard-secret';
    const decoded = jwt.verify(token, secret) as { adminId: string };
    const admin = await Admin.findById(decoded.adminId).select('-password');

    if (!admin) {
      res.status(401).json({ message: 'Admin not found' });
      return;
    }

    req.admin = admin as typeof admin & { _id: typeof admin._id };
    next();
  } catch {
    res.status(401).json({ message: 'Token failed' });
  }
};
