import jwt from 'jsonwebtoken';

export const signToken = (adminId: string) => {
  const secret = process.env.JWT_SECRET || 'football-dashboard-secret';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

  return jwt.sign({ adminId }, secret, { expiresIn });
};
