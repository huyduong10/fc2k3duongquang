import { useEffect, useState } from 'react';
import { Activity, BadgeCheck, Coins, Trophy } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import type { DashboardStats } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDate, resultLabel } from '../lib/format';

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const refresh = () => loadStats();
    socket.on('players:updated', refresh);
    socket.on('matches:updated', refresh);
    socket.on('payments:updated', refresh);

    return () => {
      socket.off('players:updated', refresh);
      socket.off('matches:updated', refresh);
      socket.off('payments:updated', refresh);
    };
  }, []);

  const monthlySeries = stats?.monthlySeries || [];
  const topAssisters = stats?.topAssisters || [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-pitch-300/70">Tổng quan</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Bảng điều khiển</h1>
        </div>
        <Badge tone="success">Mùa giải đang diễn ra</Badge>
      </div>

      {loading || !stats ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-[1.75rem]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng cầu thủ" value={stats.totals.players} icon={BadgeCheck} caption="Đội hình đăng ký" />
          <StatCard title="Tổng trận" value={stats.totals.matches} icon={Activity} caption="Lịch sử thi đấu" />
          <StatCard title="Tỉ lệ thắng" value={`${stats.totals.winRate}%`} icon={Trophy} caption="Toàn bộ trận đã chơi" />
          <StatCard title="Tiền đã thu" value={formatCurrency(stats.totals.totalCollected)} icon={Coins} caption={`Còn thiếu ${formatCurrency(stats.totals.totalShortfall)}`} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Xu hướng theo tháng</p>
              <h2 className="text-xl font-semibold text-white">Biểu đồ hiệu suất</h2>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySeries}>
                <defs>
                  <linearGradient id="goalsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Area type="monotone" dataKey="goalsFor" stroke="#22c55e" fill="url(#goalsGradient)" strokeWidth={2} />
                <Bar dataKey="wins" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Top ghi bàn</p>
          <h2 className="text-xl font-semibold text-white">Cầu thủ phong độ cao</h2>
          <div className="mt-4 space-y-4">
            {stats?.topScorers?.slice(0, 5).map((player) => (
              <div key={player._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{player.fullName}</p>
                  <p className="text-sm text-slate-400">#{player.jerseyNumber} · {player.position}</p>
                </div>
                <Badge tone="success">{player.goals} bàn</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Top kiến tạo</p>
          <h2 className="text-xl font-semibold text-white">Nhạc trưởng tuyến giữa</h2>
          <div className="mt-4 space-y-4">
            {topAssisters.slice(0, 5).map((player) => (
              <div key={player._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{player.fullName}</p>
                  <p className="text-sm text-slate-400">#{player.jerseyNumber} · {player.position}</p>
                </div>
                <Badge tone="info">{player.assists} kiến tạo</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Trận gần đây</p>
          <h2 className="text-xl font-semibold text-white">Dòng thời gian</h2>
          <div className="mt-4 space-y-4">
            {stats?.recentMatches?.slice(0, 5).map((match) => {
              const badgeTone = match.result === 'win' ? 'success' : match.result === 'draw' ? 'warning' : 'danger';
              return (
                <div key={match._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{match.matchName}</p>
                      <p className="text-sm text-slate-400">{match.opponent} · {formatDate(match.matchDate)}</p>
                    </div>
                    <Badge tone={badgeTone as 'success' | 'warning' | 'danger'}>{resultLabel(match.result)}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    {match.scoreFor} - {match.scoreAgainst} tại {match.venue}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {stats ? (
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Tổng quan tài chính</p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Tổng cần đóng</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(stats.totals.totalDue)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Đã thu</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(stats.totals.totalCollected)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Còn thiếu</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(stats.totals.totalShortfall)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
