export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';
export type MatchResult = 'win' | 'draw' | 'loss';
export type PaymentStatus = 'paid' | 'partial' | 'pending';

export interface Player {
  _id: string;
  fullName: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  jerseyNumber: number;
  position: PlayerPosition;
  goals: number;
  yellowCards: number;
  assists: number;
  appearances: number;
}

export interface MatchScorer {
  player: Player;
  goals: number;
}

export interface Match {
  _id: string;
  matchName: string;
  matchDate: string;
  venue: string;
  opponent: string;
  scoreFor: number;
  scoreAgainst: number;
  result: MatchResult;
  players: Player[];
  scorers: MatchScorer[];
  notes?: string;
}

export interface PaymentParticipant {
  player: Player;
  hasPaid: boolean;
  amount: number;
  paidAt?: string | null;
}

export interface Payment {
  _id: string;
  match: Match;
  totalDue: number;
  totalCollected: number;
  currency: string;
  participants: PaymentParticipant[];
  status: PaymentStatus;
  notes?: string;
  settlementDate?: string | null;
}

export interface PublicPayment extends Payment {
  paidCount: number;
  unpaidCount: number;
  remainingAmount: number;
  updatedAt: string;
}

export interface DashboardStats {
  totals: {
    players: number;
    matches: number;
    goals: number;
    assists: number;
    winRate: number;
    totalDue: number;
    totalCollected: number;
    totalShortfall: number;
  };
  topScorers: Player[];
  topAssisters: Player[];
  recentMatches: Match[];
  monthlySeries: Array<{
    label: string;
    matches: number;
    goalsFor: number;
    wins: number;
  }>;
}

export interface AuthAdmin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}
