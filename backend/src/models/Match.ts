import { Schema, model, Types, type Document } from 'mongoose';

export type MatchResult = 'win' | 'draw' | 'loss';

export interface MatchScorer {
  player: Types.ObjectId;
  goals: number;
}

export interface MatchDocument extends Document {
  matchName: string;
  matchDate: Date;
  venue: string;
  opponent: string;
  scoreFor: number;
  scoreAgainst: number;
  result: MatchResult;
  players: Types.ObjectId[];
  scorers: MatchScorer[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scorerSchema = new Schema<MatchScorer>(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    goals: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const matchSchema = new Schema<MatchDocument>(
  {
    matchName: { type: String, required: true, trim: true },
    matchDate: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    opponent: { type: String, required: true, trim: true },
    scoreFor: { type: Number, required: true, min: 0 },
    scoreAgainst: { type: Number, required: true, min: 0 },
    result: { type: String, required: true, enum: ['win', 'draw', 'loss'] },
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    scorers: { type: [scorerSchema], default: [] },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Match = model<MatchDocument>('Match', matchSchema);
