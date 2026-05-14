import { Schema, model, type Document } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'rejected';

export interface BookingDocument extends Document {
  teamName: string;
  sundayDate: Date;
  contactPhone?: string;
  contactFacebook?: string;
  note?: string;
  status: BookingStatus;
  adminNote?: string;
  confirmedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    teamName: { type: String, required: true, trim: true },
    sundayDate: { type: Date, required: true, index: true },
    contactPhone: { type: String, trim: true, default: '' },
    contactFacebook: { type: String, trim: true, default: '' },
    note: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
    adminNote: { type: String, trim: true, default: '' },
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Booking = model<BookingDocument>('Booking', bookingSchema);
