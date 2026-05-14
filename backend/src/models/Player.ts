import { Schema, model, Types, type Document } from 'mongoose';

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export interface PlayerDocument extends Document {
  fullName: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  jerseyNumber: number;
  position: PlayerPosition;
  goals: number;
  yellowCards: number;
  assists: number;
  appearances: number;
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new Schema<PlayerDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' },
    avatarPublicId: { type: String, default: '' },
    jerseyNumber: { type: Number, required: true, min: 0 },
    position: { type: String, required: true, enum: ['GK', 'DF', 'MF', 'FW'] },
    goals: { type: Number, default: 0, min: 0 },
    yellowCards: { type: Number, default: 0, min: 0 },
    assists: { type: Number, default: 0, min: 0 },
    appearances: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const Player = model<PlayerDocument>('Player', playerSchema);
export type PlayerId = Types.ObjectId;
