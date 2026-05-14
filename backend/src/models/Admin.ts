import bcrypt from 'bcryptjs';
import { Schema, model, type Document } from 'mongoose';

export interface AdminDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin';
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const adminSchema = new Schema<AdminDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: 'admin', enum: ['admin'] },
  },
  { timestamps: true },
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Admin = model<AdminDocument>('Admin', adminSchema);
