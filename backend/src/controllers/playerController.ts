import type { Request, Response } from 'express';
import { Player } from '../models/Player.js';
import { emitSocketEvent } from '../config/socket.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getPagination = (query: Request['query']) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  return { page, limit };
};

export const getPlayers = asyncHandler(async (req: Request, res: Response) => {
  const { search = '', position = '', sort = 'goals', order = 'desc' } = req.query as Record<string, string>;
  const { page, limit } = getPagination(req.query);
  const filter: Record<string, unknown> = {};

  if (search) {
    filter.fullName = { $regex: search, $options: 'i' };
  }

  if (position) {
    filter.position = position;
  }

  const sortDirection = order === 'asc' ? 1 : -1;
  const [items, total] = await Promise.all([
    Player.find(filter)
      .sort({ [sort]: sortDirection, fullName: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Player.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    total,
  });
});

export const getPlayerById = asyncHandler(async (req: Request, res: Response) => {
  const player = await Player.findById(req.params.id);

  if (!player) {
    res.status(404).json({ message: 'Player not found' });
    return;
  }

  res.json(player);
});

export const createPlayer = asyncHandler(async (req: Request, res: Response) => {
  const player = await Player.create(req.body);
  emitSocketEvent('players:updated', { action: 'created', playerId: player._id });
  res.status(201).json(player);
});

export const updatePlayer = asyncHandler(async (req: Request, res: Response) => {
  const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!player) {
    res.status(404).json({ message: 'Player not found' });
    return;
  }

  emitSocketEvent('players:updated', { action: 'updated', playerId: player._id });
  res.json(player);
});

export const deletePlayer = asyncHandler(async (req: Request, res: Response) => {
  const player = await Player.findByIdAndDelete(req.params.id);

  if (!player) {
    res.status(404).json({ message: 'Player not found' });
    return;
  }

  emitSocketEvent('players:updated', { action: 'deleted', playerId: player._id });
  res.json({ message: 'Player removed' });
});
