import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri: string) => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(mongoUri);
};
