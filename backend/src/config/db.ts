import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri: string) => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  const timeout = Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 15000);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: timeout,
  });
};
