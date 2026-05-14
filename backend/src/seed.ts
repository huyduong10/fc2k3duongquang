import dotenv from 'dotenv';
import { connectDatabase } from './config/db.js';
import { Admin } from './models/Admin.js';
import { Match } from './models/Match.js';
import { Payment } from './models/Payment.js';
import { Player } from './models/Player.js';

dotenv.config();

const seed = async () => {
  await connectDatabase(process.env.MONGODB_URI || '');

  await Promise.all([
    Admin.deleteMany({}),
    Player.deleteMany({}),
    Match.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  await Admin.create({
    name: 'Admin Team',
    email: process.env.ADMIN_EMAIL || 'admin@football.local',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
  });

  const players = await Player.insertMany([
    { fullName: 'Nguyen Van A', jerseyNumber: 1, position: 'GK', goals: 0, yellowCards: 1, assists: 0, appearances: 10, avatarUrl: 'https://ui-avatars.com/api/?name=Nguyen+Van+A' },
    { fullName: 'Tran Van B', jerseyNumber: 2, position: 'DF', goals: 1, yellowCards: 2, assists: 2, appearances: 10, avatarUrl: 'https://ui-avatars.com/api/?name=Tran+Van+B' },
    { fullName: 'Le Van C', jerseyNumber: 3, position: 'DF', goals: 0, yellowCards: 0, assists: 1, appearances: 9, avatarUrl: 'https://ui-avatars.com/api/?name=Le+Van+C' },
    { fullName: 'Pham Van D', jerseyNumber: 4, position: 'MF', goals: 2, yellowCards: 3, assists: 4, appearances: 10, avatarUrl: 'https://ui-avatars.com/api/?name=Pham+Van+D' },
    { fullName: 'Hoang Van E', jerseyNumber: 5, position: 'MF', goals: 3, yellowCards: 1, assists: 5, appearances: 10, avatarUrl: 'https://ui-avatars.com/api/?name=Hoang+Van+E' },
    { fullName: 'Bui Van F', jerseyNumber: 6, position: 'FW', goals: 7, yellowCards: 0, assists: 3, appearances: 9, avatarUrl: 'https://ui-avatars.com/api/?name=Bui+Van+F' },
    { fullName: 'Do Van G', jerseyNumber: 7, position: 'FW', goals: 6, yellowCards: 1, assists: 2, appearances: 8, avatarUrl: 'https://ui-avatars.com/api/?name=Do+Van+G' },
    { fullName: 'Nguyen Van H', jerseyNumber: 8, position: 'MF', goals: 4, yellowCards: 2, assists: 6, appearances: 10, avatarUrl: 'https://ui-avatars.com/api/?name=Nguyen+Van+H' },
    { fullName: 'Tran Van I', jerseyNumber: 9, position: 'FW', goals: 5, yellowCards: 1, assists: 1, appearances: 10, avatarUrl: 'https://ui-avatars.com/api/?name=Tran+Van+I' },
    { fullName: 'Le Van K', jerseyNumber: 10, position: 'MF', goals: 2, yellowCards: 0, assists: 4, appearances: 8, avatarUrl: 'https://ui-avatars.com/api/?name=Le+Van+K' },
  ]);

  const matchDocs = await Match.insertMany([
    {
      matchName: 'League Opener',
      matchDate: new Date('2026-01-12'),
      venue: 'Training Ground A',
      opponent: 'Red Lions FC',
      scoreFor: 3,
      scoreAgainst: 1,
      result: 'win',
      players: players.slice(0, 8).map((player) => player._id),
      scorers: [
        { player: players[5]._id, goals: 2 },
        { player: players[4]._id, goals: 1 },
      ],
      notes: 'Strong start to the season',
    },
    {
      matchName: 'Cup Round 1',
      matchDate: new Date('2026-01-25'),
      venue: 'City Stadium',
      opponent: 'Blue River',
      scoreFor: 2,
      scoreAgainst: 2,
      result: 'draw',
      players: players.slice(0, 9).map((player) => player._id),
      scorers: [
        { player: players[6]._id, goals: 1 },
        { player: players[7]._id, goals: 1 },
      ],
      notes: 'Late equalizer secured a point',
    },
    {
      matchName: 'Friendly Night',
      matchDate: new Date('2026-02-08'),
      venue: 'Night Arena',
      opponent: 'Golden Stars',
      scoreFor: 1,
      scoreAgainst: 2,
      result: 'loss',
      players: players.slice(1, 9).map((player) => player._id),
      scorers: [{ player: players[8]._id, goals: 1 }],
      notes: 'Rotated squad',
    },
    {
      matchName: 'Derby Clash',
      matchDate: new Date('2026-03-05'),
      venue: 'Home Pitch',
      opponent: 'River United',
      scoreFor: 4,
      scoreAgainst: 0,
      result: 'win',
      players: players.slice(0, 10).map((player) => player._id),
      scorers: [
        { player: players[5]._id, goals: 2 },
        { player: players[7]._id, goals: 1 },
        { player: players[8]._id, goals: 1 },
      ],
      notes: 'Best attacking performance',
    },
    {
      matchName: 'Season Finale',
      matchDate: new Date('2026-04-18'),
      venue: 'Away Ground',
      opponent: 'Steel Town',
      scoreFor: 2,
      scoreAgainst: 0,
      result: 'win',
      players: players.slice(0, 8).map((player) => player._id),
      scorers: [
        { player: players[4]._id, goals: 1 },
        { player: players[5]._id, goals: 1 },
      ],
      notes: 'Clean sheet to close the month',
    },
  ]);

  await Payment.insertMany(
    matchDocs.map((matchDoc, index) => {
      const matchPlayers = Array.isArray(matchDoc.players) ? matchDoc.players : [];
      const participantAmount = 50000 + index * 10000;
      const participants = matchPlayers.map((playerId, participantIndex) => ({
        player: playerId,
        hasPaid: participantIndex % 2 === 0 || index < 2,
        amount: participantAmount,
        paidAt: participantIndex % 2 === 0 || index < 2 ? new Date() : null,
      }));
      const totalDue = participants.reduce((sum, participant) => sum + participant.amount, 0);
      const totalCollected = participants.reduce((sum, participant) => sum + (participant.hasPaid ? participant.amount : 0), 0);

      return {
        match: matchDoc._id,
        totalDue,
        totalCollected,
        currency: 'VND',
        participants,
        status: totalCollected >= totalDue ? 'paid' : totalCollected > 0 ? 'partial' : 'pending',
        notes: 'Seeded payment record',
        settlementDate: totalCollected >= totalDue ? new Date() : null,
      };
    }),
  );

  // eslint-disable-next-line no-console
  console.log('Seed data created successfully');
  process.exit(0);
};

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
