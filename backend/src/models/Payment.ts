import { Schema, model, Types, type Document } from 'mongoose';

export interface PaymentParticipant {
  player: Types.ObjectId;
  hasPaid: boolean;
  amount: number;
  paidAt?: Date | null;
}

export interface PaymentDocument extends Document {
  match: Types.ObjectId;
  totalDue: number;
  totalCollected: number;
  currency: string;
  participants: PaymentParticipant[];
  status: 'paid' | 'partial' | 'pending';
  notes?: string;
  settlementDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<PaymentParticipant>(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    hasPaid: { type: Boolean, default: false },
    amount: { type: Number, required: true, min: 0 },
    paidAt: { type: Date, default: null },
  },
  { _id: false },
);

const paymentSchema = new Schema<PaymentDocument>(
  {
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    totalDue: { type: Number, required: true, min: 0 },
    totalCollected: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'VND' },
    participants: { type: [participantSchema], default: [] },
    status: { type: String, default: 'pending', enum: ['paid', 'partial', 'pending'] },
    notes: { type: String, default: '' },
    settlementDate: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Payment = model<PaymentDocument>('Payment', paymentSchema);
