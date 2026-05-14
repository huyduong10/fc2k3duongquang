import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import type { Match, MatchResult, Player } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate, resultLabel } from '../lib/format';

interface MatchFormState {
  matchName: string;
  matchDate: string;
  venue: string;
  opponent: string;
  scoreFor: number;
  scoreAgainst: number;
  result: MatchResult;
  notes: string;
  players: string[];
  scorers: Array<{ playerId: string; goals: number }>;
}

const emptyForm = (): MatchFormState => ({
  matchName: '',
  matchDate: '',
  venue: '',
  opponent: '',
  scoreFor: 0,
  scoreAgainst: 0,
  result: 'win',
  notes: '',
  players: [],
  scorers: [{ playerId: '', goals: 1 }],
});

export const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [form, setForm] = useState<MatchFormState>(emptyForm());

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchResponse, playerResponse] = await Promise.all([
        api.get('/matches'),
        api.get('/players', { params: { limit: 100, sort: 'goals', order: 'desc' } }),
      ]);
      setMatches(matchResponse.data.items || []);
      setPlayers(playerResponse.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const refresh = () => loadData();
    socket.on('matches:updated', refresh);
    return () => {
      socket.off('matches:updated', refresh);
    };
  }, []);

  const openCreate = () => {
    setEditingMatch(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (match: Match) => {
    setEditingMatch(match);
    setForm({
      matchName: match.matchName,
      matchDate: match.matchDate.slice(0, 10),
      venue: match.venue,
      opponent: match.opponent,
      scoreFor: match.scoreFor,
      scoreAgainst: match.scoreAgainst,
      result: match.result,
      notes: match.notes || '',
      players: match.players.map((player) => player._id),
      scorers: match.scorers.length > 0 ? match.scorers.map((scorer) => ({ playerId: scorer.player._id, goals: scorer.goals })) : [{ playerId: '', goals: 1 }],
    });
    setModalOpen(true);
  };

  const saveMatch = async () => {
    try {
      const payload = {
        ...form,
        scoreFor: Number(form.scoreFor),
        scoreAgainst: Number(form.scoreAgainst),
        players: form.players,
        scorers: form.scorers.filter((row) => row.playerId).map((row) => ({ player: row.playerId, goals: Number(row.goals) })),
      };

      if (editingMatch) {
        await api.put(`/matches/${editingMatch._id}`, payload);
        toast.success('Đã cập nhật trận đấu');
      } else {
        await api.post('/matches', payload);
        toast.success('Đã tạo trận đấu');
      }

      setModalOpen(false);
      loadData();
    } catch {
      toast.error('Không thể lưu trận đấu');
    }
  };

  const removeMatch = async (match: Match) => {
    if (!window.confirm(`Xóa ${match.matchName}?`)) {
      return;
    }

    try {
      await api.delete(`/matches/${match._id}`);
      toast.success('Đã xóa trận đấu');
      loadData();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const resultStats = useMemo(() => {
    const wins = matches.filter((match) => match.result === 'win').length;
    return {
      total: matches.length,
      wins,
      winRate: matches.length ? Math.round((wins / matches.length) * 100) : 0,
    };
  }, [matches]);

  const toggleParticipant = (playerId: string) => {
    setForm((current) => ({
      ...current,
      players: current.players.includes(playerId)
        ? current.players.filter((id) => id !== playerId)
        : [...current.players, playerId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-pitch-300/70">Quản lý trận đấu</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Lịch sử thi đấu</h1>
          <p className="mt-2 text-sm text-slate-400">Theo dõi lịch, kết quả, cầu thủ tham gia và người ghi bàn.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} />
          Thêm trận đấu
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Tổng trận</p>
          <p className="mt-2 text-3xl font-semibold text-white">{resultStats.total}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Số trận thắng</p>
          <p className="mt-2 text-3xl font-semibold text-white">{resultStats.wins}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Tỉ lệ thắng</p>
          <p className="mt-2 text-3xl font-semibold text-white">{resultStats.winRate}%</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel overflow-hidden rounded-[2rem] shadow-glow">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {matches.map((match) => (
                <div key={match._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{match.matchName}</p>
                      <p className="mt-1 text-sm text-slate-400">{match.opponent} · {match.venue} · {formatDate(match.matchDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={match.result === 'win' ? 'success' : match.result === 'draw' ? 'warning' : 'danger'}>
                        {resultLabel(match.result)}
                      </Badge>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-xl font-semibold text-white">
                        {match.scoreFor} - {match.scoreAgainst}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                    <Badge tone="info">Cầu thủ: {match.players.length}</Badge>
                    <Badge tone="neutral">Ghi bàn: {match.scorers.length}</Badge>
                    <Badge tone="neutral">{match.notes || 'Không có ghi chú'}</Badge>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => openEdit(match)} className="bg-white/10 text-white hover:bg-white/15">Sửa</Button>
                    <Button onClick={() => removeMatch(match)} className="bg-rose-500/15 text-rose-300 hover:bg-rose-500/25">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Timeline</p>
          <h2 className="text-xl font-semibold text-white">Dòng thời gian</h2>
          <div className="mt-4 space-y-4">
            {matches.slice(0, 5).map((match) => (
              <div key={match._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{match.matchName}</p>
                <p className="mt-1 text-sm text-slate-400">{formatDate(match.matchDate)}</p>
                <p className="mt-3 text-sm text-slate-300">gặp {match.opponent} - {match.scoreFor}:{match.scoreAgainst}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editingMatch ? 'Sửa trận đấu' : 'Tạo trận đấu'}
        onClose={() => setModalOpen(false)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Tên trận" value={form.matchName} onChange={(event) => setForm({ ...form, matchName: event.target.value })} />
          <Input type="date" value={form.matchDate} onChange={(event) => setForm({ ...form, matchDate: event.target.value })} />
          <Input placeholder="Địa điểm" value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} />
          <Input placeholder="Đối thủ" value={form.opponent} onChange={(event) => setForm({ ...form, opponent: event.target.value })} />
          <Input type="number" placeholder="Bàn thắng đội nhà" value={form.scoreFor} onChange={(event) => setForm({ ...form, scoreFor: Number(event.target.value) })} />
          <Input type="number" placeholder="Bàn thắng đối thủ" value={form.scoreAgainst} onChange={(event) => setForm({ ...form, scoreAgainst: Number(event.target.value) })} />
          <Select value={form.result} onChange={(event) => setForm({ ...form, result: event.target.value as MatchResult })}>
            <option value="win">Thắng</option>
            <option value="draw">Hòa</option>
            <option value="loss">Thua</option>
          </Select>
          <Input placeholder="Ghi chú" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-sm text-slate-300">Cầu thủ tham gia</p>
            <div className="max-h-56 space-y-2 overflow-auto pr-2">
              {players.map((player) => (
                <label key={player._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-slate-200">
                  <span>{player.fullName}</span>
                  <input type="checkbox" checked={form.players.includes(player._id)} onChange={() => toggleParticipant(player._id)} />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-300">Người ghi bàn</p>
              <Button
                type="button"
                className="bg-white/10 text-white hover:bg-white/15"
                onClick={() => setForm((current) => ({ ...current, scorers: [...current.scorers, { playerId: '', goals: 1 }] }))}
              >
                Thêm người ghi bàn
              </Button>
            </div>
            <div className="space-y-3">
              {form.scorers.map((row, index) => (
                <div key={`${index}-${row.playerId}`} className="grid grid-cols-[1fr_96px] gap-3">
                  <Select value={row.playerId} onChange={(event) => setForm((current) => {
                    const next = [...current.scorers];
                    next[index] = { ...next[index], playerId: event.target.value };
                    return { ...current, scorers: next };
                  })}>
                    <option value="">Chọn cầu thủ</option>
                    {players.map((player) => (
                      <option key={player._id} value={player._id}>{player.fullName}</option>
                    ))}
                  </Select>
                  <Input type="number" min={1} value={row.goals} onChange={(event) => setForm((current) => {
                    const next = [...current.scorers];
                    next[index] = { ...next[index], goals: Number(event.target.value) };
                    return { ...current, scorers: next };
                  })} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" onClick={() => setModalOpen(false)} className="bg-white/10 text-white hover:bg-white/15">Hủy</Button>
          <Button type="button" onClick={saveMatch}>{editingMatch ? 'Cập nhật trận' : 'Tạo trận'}</Button>
        </div>
      </Modal>
    </div>
  );
};
