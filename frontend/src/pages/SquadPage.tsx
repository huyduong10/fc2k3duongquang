import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../lib/api';
import type { Player } from '../types';

export const SquadPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get('/players', { params: { limit: 50, sort: 'goals', search, position } });
        setPlayers(response.data.items);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search, position]);

  const grouped = useMemo(() => players, [players]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-pitch-300/70">Đội hình công khai</p>
          <h2 className="mt-2 text-4xl font-semibold text-white">Danh sách cầu thủ</h2>
          <p className="mt-3 max-w-2xl text-slate-300">Danh sách cầu thủ muốn sa thải</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Tìm cầu thủ" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={position} onChange={(event) => setPosition(event.target.value)}>
            <option value="">Tất cả vị trí</option>
            <option value="GK">GK</option>
            <option value="DF">DF</option>
            <option value="MF">MF</option>
            <option value="FW">FW</option>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-64 rounded-[2rem]" />)
          : grouped.map((player) => (
              <article key={player._id} className="glass-panel rounded-[2rem] p-5 shadow-glow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={player.avatarUrl} alt={player.fullName} className="h-20 w-20 rounded-3xl object-cover" />
                    <div>
                      <p className="text-xl font-semibold text-white">{player.fullName}</p>
                      <p className="mt-1 text-sm text-slate-400">#{player.jerseyNumber}</p>
                    </div>
                  </div>
                  <Badge tone="info">{player.position}</Badge>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Bàn thắng</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{player.goals ?? 0}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Kiến tạo</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{player.assists ?? 0}</p>
                  </div>
                </div>
              </article>
            ))}
      </div>
    </div>
  );
};