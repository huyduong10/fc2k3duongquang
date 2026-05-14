import type { Request, Response } from 'express';
import { Match } from '../models/Match.js';
import { Payment } from '../models/Payment.js';
import { Player } from '../models/Player.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalPlayers, totalMatches, allPlayers, matches, payments] = await Promise.all([
    Player.countDocuments(),
    Match.countDocuments(),
    Player.find(),
    Match.find().sort({ matchDate: -1 }).limit(5),
    Payment.find(),
  ]);

  const topScorers = [...allPlayers].sort((left, right) => (right.goals || 0) - (left.goals || 0)).slice(0, 5);
  const topAssisters = [...allPlayers].sort((left, right) => (right.assists || 0) - (left.assists || 0)).slice(0, 5);
  const totalGoals = allPlayers.reduce((sum, player) => sum + (player.goals || 0), 0);
  const totalAssists = allPlayers.reduce((sum, player) => sum + (player.assists || 0), 0);
  const wins = await Match.countDocuments({ result: 'win' });
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const paymentTotals = payments.reduce(
    (accumulator, payment) => {
      accumulator.totalDue += payment.totalDue;
      accumulator.totalCollected += payment.totalCollected;
      return accumulator;
    },
    { totalDue: 0, totalCollected: 0 },
  );

  const monthlyMatches = await Match.aggregate([
    {
      $group: {
        _id: { month: { $month: '$matchDate' }, year: { $year: '$matchDate' } },
        matches: { $sum: 1 },
        goalsFor: { $sum: '$scoreFor' },
        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthlySeries = monthlyMatches.map((entry) => ({
    label: `${entry._id.month}/${entry._id.year}`,
    matches: entry.matches,
    goalsFor: entry.goalsFor,
    wins: entry.wins,
  }));

  res.json({
    totals: {
      players: totalPlayers,
      matches: totalMatches,
      goals: totalGoals,
      assists: totalAssists,
      winRate,
      totalDue: paymentTotals.totalDue,
      totalCollected: paymentTotals.totalCollected,
      totalShortfall: Math.max(paymentTotals.totalDue - paymentTotals.totalCollected, 0),
    },
    topScorers,
    topAssisters,
    recentMatches: matches,
    monthlySeries,
  });
});

export const getPublicDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [players, matches] = await Promise.all([
    Player.find().sort({ goals: -1, assists: -1 }),
    Match.find()
      .populate('players', 'fullName jerseyNumber position avatarUrl goals assists yellowCards')
      .populate('scorers.player', 'fullName jerseyNumber position')
      .sort({ matchDate: -1 })
      .limit(6),
  ]);

  const monthlyMatches = await Match.aggregate([
    {
      $group: {
        _id: { month: { $month: '$matchDate' }, year: { $year: '$matchDate' } },
        matches: { $sum: 1 },
        goalsFor: { $sum: '$scoreFor' },
        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const totalMatches = matches.length;
  const wins = matches.filter((match) => match.result === 'win').length;
  const totalGoals = players.reduce((sum, player) => sum + (player.goals || 0), 0);

  res.json({
    hero: {
      totalPlayers: players.length,
      totalMatches,
      winRate: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0,
      totalGoals,
    },
    topScorers: players.slice(0, 5),
    featuredPlayers: [...players].sort((left, right) => (right.assists || 0) - (left.assists || 0)).slice(0, 4),
    recentMatches: matches,
    monthlySeries: monthlyMatches.map((entry) => ({
      label: `${entry._id.month}/${entry._id.year}`,
      matches: entry.matches,
      goalsFor: entry.goalsFor,
      wins: entry.wins,
    })),
  });
});
