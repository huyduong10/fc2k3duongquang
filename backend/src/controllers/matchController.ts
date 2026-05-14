import type { Request, Response } from 'express';
import { emitSocketEvent } from '../config/socket.js';
import { Match } from '../models/Match.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateMatch = () =>
  Match.find()
    .populate('players', 'fullName jerseyNumber position avatarUrl goals assists yellowCards')
    .populate('scorers.player', 'fullName jerseyNumber position')
    .sort({ matchDate: -1, createdAt: -1 });

export const getMatches = asyncHandler(async (_req: Request, res: Response) => {
  const items = await populateMatch();
  res.json({ items });
});

export const getMatchById = asyncHandler(async (req: Request, res: Response) => {
  const match = await Match.findById(req.params.id)
    .populate('players', 'fullName jerseyNumber position avatarUrl goals assists yellowCards')
    .populate('scorers.player', 'fullName jerseyNumber position');

  if (!match) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  res.json(match);
});

export const createMatch = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body };

  if (!payload.result) {
    payload.result = Number(payload.scoreFor) > Number(payload.scoreAgainst) ? 'win' : Number(payload.scoreFor) < Number(payload.scoreAgainst) ? 'loss' : 'draw';
  }

  const match = await Match.create(payload);
  emitSocketEvent('matches:updated', { action: 'created', matchId: match._id });
  res.status(201).json(match);
});

export const updateMatch = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body };

  if (!payload.result && payload.scoreFor !== undefined && payload.scoreAgainst !== undefined) {
    payload.result = Number(payload.scoreFor) > Number(payload.scoreAgainst) ? 'win' : Number(payload.scoreFor) < Number(payload.scoreAgainst) ? 'loss' : 'draw';
  }

  const match = await Match.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    .populate('players', 'fullName jerseyNumber position avatarUrl goals assists yellowCards')
    .populate('scorers.player', 'fullName jerseyNumber position');

  if (!match) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  emitSocketEvent('matches:updated', { action: 'updated', matchId: match._id });
  res.json(match);
});

export const deleteMatch = asyncHandler(async (req: Request, res: Response) => {
  const match = await Match.findByIdAndDelete(req.params.id);

  if (!match) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  emitSocketEvent('matches:updated', { action: 'deleted', matchId: match._id });
  res.json({ message: 'Match removed' });
});
