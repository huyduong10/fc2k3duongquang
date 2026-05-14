import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import type { Player, PlayerPosition } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency } from '../lib/format';

interface PlayerFormState {
  fullName: string;
  avatarUrl: string;
  jerseyNumber: number;
  position: PlayerPosition;
  goals: number;
  yellowCards: number;
  assists: number;
  appearances: number;
}

const emptyForm = (): PlayerFormState => ({
  fullName: '',
  avatarUrl: '',
  jerseyNumber: 0,
  position: 'MF',
  goals: 0,
  yellowCards: 0,
  assists: 0,
  appearances: 0,
});

export const PlayersPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [sort, setSort] = useState('goals');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState<PlayerFormState>(emptyForm());

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/players', {
        params: {
          search,
          position,
          sort,
          page,
          limit: 8,
        },
      });
      setPlayers(data.items);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, position, sort, page]);

  useEffect(() => {
    const refresh = () => loadPlayers();
    socket.on('players:updated', refresh);
    return () => {
      socket.off('players:updated', refresh);
    };
  }, [search, position, sort, page]);

  const resetModal = () => {
    setEditingPlayer(null);
    setForm(emptyForm());
    setModalOpen(false);
  };

  const openCreate = () => {
    setEditingPlayer(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (player: Player) => {
    setEditingPlayer(player);
    setForm({
      fullName: player.fullName,
      avatarUrl: player.avatarUrl || '',
      jerseyNumber: player.jerseyNumber,
      position: player.position,
      goals: player.goals,
      yellowCards: player.yellowCards,
      assists: player.assists,
      appearances: player.appearances,
    });
    setModalOpen(true);
  };

  const savePlayer = async () => {
    const payload = {
      ...form,
      jerseyNumber: Number(form.jerseyNumber),
      goals: Number(form.goals),
      yellowCards: Number(form.yellowCards),
      assists: Number(form.assists),
      appearances: Number(form.appearances),
    };

    if (!payload.fullName) {
      toast.error('Vui lòng nhập tên cầu thủ');
      return;
    }

    try {
      if (editingPlayer) {
        await api.put(`/players/${editingPlayer._id}`, payload);
        toast.success('Đã cập nhật cầu thủ');
      } else {
        await api.post('/players', payload);
        toast.success('Đã thêm cầu thủ');
      }
      resetModal();
      loadPlayers();
    } catch {
      toast.error('Không thể lưu cầu thủ');
    }
  };

  const removePlayer = async (player: Player) => {
    if (!window.confirm(`Xóa ${player.fullName}?`)) {
      return;
    }

    try {
      await api.delete(`/players/${player._id}`);
      toast.success('Đã xóa cầu thủ');
      loadPlayers();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const totalGoalValue = useMemo(() => players.reduce((sum, player) => sum + player.goals, 0), [players]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-pitch-300/70">Quản lý đội hình</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Cầu thủ</h1>
          <p className="mt-2 text-sm text-slate-400">Tìm kiếm, lọc theo vị trí và sắp xếp theo phong độ.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} />
          Thêm cầu thủ
        </Button>
      </div>

      <div className="glass-panel rounded-[2rem] p-4 shadow-glow">
        <div className="grid gap-3 lg:grid-cols-[1.25fr_repeat(3,0.6fr)_auto]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Tìm cầu thủ" className="pl-10" />
          </div>
          <Select value={position} onChange={(event) => { setPage(1); setPosition(event.target.value); }}>
            <option value="">Tất cả vị trí</option>
            <option value="GK">GK</option>
            <option value="DF">DF</option>
            <option value="MF">MF</option>
            <option value="FW">FW</option>
          </Select>
          <Select value={sort} onChange={(event) => { setPage(1); setSort(event.target.value); }}>
            <option value="goals">Sắp xếp theo bàn thắng</option>
            <option value="assists">Sắp xếp theo kiến tạo</option>
            <option value="yellowCards">Sắp xếp theo thẻ vàng</option>
          </Select>
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-300">
            {totalGoalValue} bàn thắng trong trang
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-[2rem] shadow-glow">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left">
                <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Cầu thủ</th>
                    <th className="px-5 py-4">Số áo</th>
                    <th className="px-5 py-4">Vị trí</th>
                    <th className="px-5 py-4">Bàn thắng</th>
                    <th className="px-5 py-4">Kiến tạo</th>
                    <th className="px-5 py-4">Thẻ</th>
                    <th className="px-5 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {players.map((player) => (
                    <tr key={player._id} className="bg-white/0 transition hover:bg-white/5">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {player.avatarUrl ? (
                            <img src={player.avatarUrl} alt={player.fullName} className="h-11 w-11 rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pitch-500/20 text-sm font-semibold text-pitch-200">{player.fullName.slice(0, 2).toUpperCase()}</div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{player.fullName}</p>
                            <p className="text-sm text-slate-400">{player.goals} bàn · {player.assists} kiến tạo</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">#{player.jerseyNumber}</td>
                      <td className="px-5 py-4"><Badge tone="info">{player.position}</Badge></td>
                      <td className="px-5 py-4 text-slate-200">{player.goals}</td>
                      <td className="px-5 py-4 text-slate-200">{player.assists}</td>
                      <td className="px-5 py-4 text-slate-200">{player.yellowCards}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <Button onClick={() => openEdit(player)} className="bg-white/10 px-4 py-2 text-white hover:bg-white/15">
                            Sửa
                          </Button>
                          <Button onClick={() => removePlayer(player)} className="bg-rose-500/15 px-4 py-2 text-rose-300 hover:bg-rose-500/25">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>Trang {page} / {pages}</p>
              <div className="flex gap-2">
                <Button disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))} className="bg-white/10 text-white hover:bg-white/15">Trước</Button>
                <Button disabled={page >= pages} onClick={() => setPage((current) => Math.min(current + 1, pages))} className="bg-white/10 text-white hover:bg-white/15">Sau</Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingPlayer ? 'Sửa cầu thủ' : 'Thêm cầu thủ'}
        onClose={resetModal}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Họ và tên" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <Input placeholder="Avatar URL" value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} />
          <Input type="number" placeholder="Số áo" value={form.jerseyNumber} onChange={(event) => setForm({ ...form, jerseyNumber: Number(event.target.value) })} />
          <Select value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value as PlayerPosition })}>
            <option value="GK">GK</option>
            <option value="DF">DF</option>
            <option value="MF">MF</option>
            <option value="FW">FW</option>
          </Select>
          <Input type="number" placeholder="Bàn thắng" value={form.goals} onChange={(event) => setForm({ ...form, goals: Number(event.target.value) })} />
          <Input type="number" placeholder="Kiến tạo" value={form.assists} onChange={(event) => setForm({ ...form, assists: Number(event.target.value) })} />
          <Input type="number" placeholder="Thẻ vàng" value={form.yellowCards} onChange={(event) => setForm({ ...form, yellowCards: Number(event.target.value) })} />
          <Input type="number" placeholder="Số trận" value={form.appearances} onChange={(event) => setForm({ ...form, appearances: Number(event.target.value) })} />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" onClick={resetModal} className="bg-white/10 text-white hover:bg-white/15">Hủy</Button>
          <Button type="button" onClick={savePlayer}>{editingPlayer ? 'Cập nhật' : 'Tạo mới'}</Button>
        </div>
      </Modal>
    </div>
  );
};
