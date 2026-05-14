import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../lib/api';
import { formatDate, resultLabel } from '../lib/format';
import type { Match } from '../types';

export const FixturesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get('/matches');
        setMatches(response.data.items || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const wins = matches.filter((match) => match.result === 'win').length;
    return {
      total: matches.length,
      wins,
      draws: matches.filter((match) => match.result === 'draw').length,
    };
  }, [matches]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-pitch-300/70">Lịch thi đấu & kết quả</p>
          <h2 className="mt-2 text-4xl font-semibold text-white">Theo dõi từng trận đấu</h2>
          <p className="mt-3 max-w-xl text-slate-300">Timeline công khai rõ ràng về địa điểm, đối thủ, tỉ số và kết quả.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-[1.75rem]" />)
              : [
                  ['Tổng trận', stats.total],
                  ['Thắng', stats.wins],
                  ['Hòa', stats.draws],
                ].map(([label, value]) => (
                  <div key={label} className="glass-panel rounded-[1.75rem] p-5 shadow-glow">
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
                  </div>
                ))}
          </div>
        </div>

        <div className="space-y-4">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-[2rem]" />)
            : matches.map((match) => (
                <article key={match._id} className="glass-panel rounded-[2rem] p-5 shadow-glow">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-white">{match.matchName}</p>
                      <p className="mt-1 text-slate-300">gặp {match.opponent}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={match.result === 'win' ? 'success' : match.result === 'draw' ? 'warning' : 'danger'}>
                        {resultLabel(match.result)}
                      </Badge>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-lg font-semibold text-white">
                        {match.scoreFor} - {match.scoreAgainst}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-2"><CalendarDays size={14} />{formatDate(match.matchDate)}</span>
                    <span className="inline-flex items-center gap-2"><MapPin size={14} />{match.venue}</span>
                    <span>{match.players.length} cầu thủ tham gia</span>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </div>
  );
};