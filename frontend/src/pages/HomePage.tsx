import { ArrowRight, Goal, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../lib/api';
import { formatDate, resultLabel } from '../lib/format';
import type { Match, Player } from '../types';

interface PublicDashboardData {
  hero: {
    totalPlayers: number;
    totalMatches: number;
    winRate: number;
    totalGoals: number;
  };
  topScorers: Player[];
  featuredPlayers: Player[];
  recentMatches: Match[];
  monthlySeries: Array<{
    label: string;
    matches: number;
    goalsFor: number;
    wins: number;
  }>;
}

export const HomePage = () => {
  const [data, setData] = useState<PublicDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get('/dashboard/public');
        setData(response.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge tone="success">Không gian đội bóng trực tuyến</Badge>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white lg:text-6xl">
              Cổng thông tin 2k3 DươngQuang dành cho mọi thành viên, không chỉ quản trị.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
              Theo dõi phong độ đội hình, kết quả thi đấu và hành trình mùa giải qua giao diện thể thao hiện đại.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/fixtures">
                <Button className="gap-2 px-6 py-3">
                  Xem lịch đấu
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/squad">
                <Button className="bg-white/10 px-6 py-3 text-white hover:bg-white/15">Xem đội hình</Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {loading || !data
                ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-[1.75rem]" />)
                : [
                    { label: 'Cầu thủ', value: data.hero.totalPlayers, icon: Users },
                    { label: 'Trận đấu', value: data.hero.totalMatches, icon: ShieldCheck },
                    { label: 'Tỉ lệ thắng', value: `${data.hero.winRate}%`, icon: TrophyProxy },
                    { label: 'Bàn thắng', value: data.hero.totalGoals, icon: Goal },
                  ].map((item) => (
                    <div key={item.label} className="glass-panel rounded-[1.75rem] p-5 shadow-glow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">{item.label}</p>
                          <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pitch-500/15 text-pitch-300 ring-1 ring-pitch-400/20">
                          <item.icon size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
            <p className="text-sm text-slate-400">Nhịp độ mùa giải</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Xu hướng ghi bàn</h3>
            <div className="mt-6 h-[340px]">
              {loading || !data ? (
                <Skeleton className="h-full rounded-[1.5rem]" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlySeries}>
                    <defs>
                      <linearGradient id="publicGoalsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="label" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Area type="monotone" dataKey="goalsFor" stroke="#22c55e" fill="url(#publicGoalsGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 lg:px-8 lg:pb-16">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
            <p className="text-sm text-slate-400">Cầu thủ nổi bật</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Top ghi bàn</h3>
            <div className="mt-5 space-y-4">
              {loading || !data
                ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-3xl" />)
                : data.topScorers.slice(0, 4).map((player) => (
                    <div key={player._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{player.fullName}</p>
                          <p className="mt-1 text-sm text-slate-400">#{player.jerseyNumber} · {player.position}</p>
                        </div>
                        <Badge tone="success">{player.goals} bàn</Badge>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
            <p className="text-sm text-slate-400">Kết quả mới nhất</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Các trận gần đây</h3>
            <div className="mt-5 space-y-4">
              {loading || !data
                ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-3xl" />)
                : data.recentMatches.map((match) => (
                    <div key={match._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-white">{match.matchName}</p>
                          <p className="mt-1 text-sm text-slate-400">{match.opponent} · {formatDate(match.matchDate)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge tone={match.result === 'win' ? 'success' : match.result === 'draw' ? 'warning' : 'danger'}>
                            {resultLabel(match.result)}
                          </Badge>
                          <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 font-semibold text-white">
                            {match.scoreFor} - {match.scoreAgainst}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const TrophyProxy = ShieldCheck;