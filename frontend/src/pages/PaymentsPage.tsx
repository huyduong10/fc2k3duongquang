import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileDown, Plus, Save, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import type { Match, Payment, Player, PaymentStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../lib/format';

interface PaymentFormState {
  matchId: string;
  totalDue: number;
  currency: string;
  notes: string;
  participants: Array<{ playerId: string; hasPaid: boolean; amount: number }>;
}

const emptyForm = (): PaymentFormState => ({
  matchId: '',
  totalDue: 0,
  currency: 'VND',
  notes: '',
  participants: [],
});

const statusTone = (status: PaymentStatus) => {
  if (status === 'paid') return 'success';
  if (status === 'partial') return 'warning';
  return 'danger';
};

const getParticipantName = (fullName?: string | null) => fullName?.trim() || 'Cau thu da roi doi';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [form, setForm] = useState<PaymentFormState>(emptyForm());

  const hasPaymentMatch = (payment: Payment): payment is Payment & { match: Match } => Boolean(payment.match);
  const isValidMatch = (match: Match | null | undefined): match is Match => Boolean(match?._id && match?.matchName);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentResponse, matchResponse, playerResponse] = await Promise.all([
        api.get('/payments'),
        api.get('/matches'),
        api.get('/players', { params: { limit: 100 } }),
      ]);
      setPayments((paymentResponse.data.items || []).filter(hasPaymentMatch));
      setMatches((matchResponse.data.items || []).filter(isValidMatch));
      setPlayers(playerResponse.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const refresh = () => loadData();
    socket.on('payments:updated', refresh);
    return () => {
      socket.off('payments:updated', refresh);
    };
  }, []);

  const createParticipantRows = (matchId: string, totalDue: number) => {
    const match = matches.find((item) => item._id === matchId);
    const matchPlayers = match?.players || [];
    if (matchPlayers.length === 0) {
      return [];
    }

    const amount = Math.max(Math.round(totalDue / matchPlayers.length), 0);
    return matchPlayers.map((player) => ({
      playerId: player._id,
      hasPaid: false,
      amount,
    }));
  };

  const openCreate = () => {
    setEditingPayment(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (payment: Payment) => {
    if (!payment.match) {
      toast.error('Thanh toan nay khong con tran dau hop le');
      return;
    }

    setEditingPayment(payment);
    setForm({
      matchId: payment.match._id,
      totalDue: payment.totalDue,
      currency: payment.currency,
      notes: payment.notes || '',
      participants: payment.participants
        .filter((participant) => Boolean(participant.player))
        .map((participant) => ({
          playerId: participant.player!._id,
          hasPaid: participant.hasPaid,
          amount: participant.amount,
        })),
    });
    setModalOpen(true);
  };

  const savePayment = async () => {
    try {
      const payload = {
        match: form.matchId,
        totalDue: Number(form.totalDue),
        currency: form.currency,
        notes: form.notes,
        participants: form.participants.map((participant) => ({
          player: participant.playerId,
          hasPaid: participant.hasPaid,
          amount: Number(participant.amount),
        })),
      };

      if (editingPayment) {
        await api.put(`/payments/${editingPayment._id}`, payload);
        toast.success('Đã cập nhật thanh toán');
      } else {
        await api.post('/payments', payload);
        toast.success('Đã tạo thanh toán');
      }

      setModalOpen(false);
      loadData();
    } catch {
      toast.error('Không thể lưu thanh toán');
    }
  };

  const updateParticipant = async (payment: Payment, playerId: string, hasPaid: boolean) => {
    const participants = payment.participants.map((participant) =>
      participant.player?._id === playerId
        ? { ...participant, hasPaid, paidAt: hasPaid ? new Date().toISOString() : null }
        : participant,
    );
    const totalCollected = participants.reduce((sum, participant) => sum + (participant.hasPaid ? participant.amount : 0), 0);

    try {
      await api.put(`/payments/${payment._id}`, {
        match: payment.match._id,
        totalDue: payment.totalDue,
        currency: payment.currency,
        notes: payment.notes || '',
        participants: participants
          .filter((participant) => Boolean(participant.player))
          .map((participant) => ({
            player: participant.player!._id,
            hasPaid: participant.hasPaid,
            amount: participant.amount,
          })),
      });
      setPayments((current) =>
        current.map((item) =>
          item._id === payment._id
            ? {
                ...item,
                participants: participants,
                totalCollected,
                status: totalCollected >= payment.totalDue ? 'paid' : totalCollected > 0 ? 'partial' : 'pending',
              }
            : item,
        ),
      );
      toast.success('Đã cập nhật thanh toán');
    } catch {
      toast.error('Không thể cập nhật thanh toán');
    }
  };

  const deletePayment = async (payment: Payment) => {
    if (!payment.match) {
      toast.error('Thanh toan nay khong con tran dau hop le');
      return;
    }

    if (!window.confirm(`Xóa thanh toán của trận ${payment.match.matchName}?`)) {
      return;
    }

    try {
      await api.delete(`/payments/${payment._id}`);
      toast.success('Đã xóa thanh toán');
      loadData();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const rows = payments.filter(hasPaymentMatch).map((payment) => ({
      Tran: payment.match.matchName,
      DoiThu: payment.match.opponent,
      TongCanDong: payment.totalDue,
      DaThu: payment.totalCollected,
      TrangThai: payment.status,
      NgayThiDau: formatDate(payment.match.matchDate),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ThanhToan');
    XLSX.writeFile(workbook, 'football-payments.xlsx');
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text('Báo cáo đóng tiền sau trận', 14, 16);
    autoTable(doc, {
      head: [['Trận', 'Đối thủ', 'Cần đóng', 'Đã thu', 'Trạng thái']],
      body: payments.filter(hasPaymentMatch).map((payment) => [
        payment.match.matchName,
        payment.match.opponent,
        formatCurrency(payment.totalDue),
        formatCurrency(payment.totalCollected),
        payment.status,
      ]),
      startY: 22,
    });
    doc.save('football-payments.pdf');
  };

  const totals = useMemo(
    () =>
      payments.reduce(
        (accumulator, payment) => {
          accumulator.due += payment.totalDue;
          accumulator.collected += payment.totalCollected;
          return accumulator;
        },
        { due: 0, collected: 0 },
      ),
    [payments],
  );

  const selectedMatch = matches.find((match) => match._id === form.matchId);
  const visiblePayments = payments.filter(hasPaymentMatch);
  const availableMatches = matches.filter(isValidMatch);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-pitch-300/70">Thanh toán</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Quản lý tiền đóng sau trận</h1>
          <p className="mt-2 text-sm text-slate-400">Checklist cầu thủ, tổng thu và công cụ xuất file theo từng trận.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportExcel} className="gap-2 bg-white/10 text-white hover:bg-white/15"><Download size={16} /> Xuất Excel</Button>
          <Button onClick={exportPdf} className="gap-2 bg-white/10 text-white hover:bg-white/15"><FileDown size={16} /> Xuất PDF</Button>
          <Button onClick={openCreate} className="gap-2"><Plus size={16} /> Thêm thanh toán</Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Tổng cần đóng</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totals.due)}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Đã thu</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totals.collected)}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Còn thiếu</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(Math.max(totals.due - totals.collected, 0))}</p>
        </div>
      </div>

      <div className="space-y-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-48" />
            ))}
          </div>
        ) : (
          visiblePayments.map((payment) => (
            <div key={payment._id} className="glass-panel rounded-[2rem] p-5 shadow-glow">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{payment.match.matchName}</p>
                  <p className="mt-1 text-sm text-slate-400">{payment.match.opponent} · {formatDate(payment.match.matchDate)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
                    <Badge tone="neutral">Cần đóng {formatCurrency(payment.totalDue, payment.currency)}</Badge>
                    <Badge tone="neutral">Đã thu {formatCurrency(payment.totalCollected, payment.currency)}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => openEdit(payment)} className="bg-white/10 text-white hover:bg-white/15">Sửa</Button>
                  <Button onClick={() => deletePayment(payment)} className="bg-rose-500/15 text-rose-300 hover:bg-rose-500/25">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-slate-300">Checklist</p>
                    <p className="text-sm text-slate-400">{payment.participants.filter((participant) => participant.hasPaid).length}/{payment.participants.length} đã đóng</p>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {payment.participants.map((participant, index) => (
                      <label
                        key={`${payment._id}-${participant.player?._id || 'unknown'}-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                      >
                        <span>{getParticipantName(participant.player?.fullName)}</span>
                        <input
                          type="checkbox"
                          checked={participant.hasPaid}
                          disabled={!participant.player}
                          onChange={(event) => participant.player && updateParticipant(payment, participant.player._id, event.target.checked)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-300">Tổng hợp</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-400">
                    <div className="flex items-center justify-between"><span>Cần đóng</span><span>{formatCurrency(payment.totalDue, payment.currency)}</span></div>
                    <div className="flex items-center justify-between"><span>Đã thu</span><span>{formatCurrency(payment.totalCollected, payment.currency)}</span></div>
                    <div className="flex items-center justify-between"><span>Còn thiếu</span><span>{formatCurrency(Math.max(payment.totalDue - payment.totalCollected, 0), payment.currency)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingPayment ? 'Sửa thanh toán' : 'Tạo thanh toán'}
        onClose={() => setModalOpen(false)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            value={form.matchId}
            onChange={(event) => {
              const matchId = event.target.value;
              const match = matches.find((item) => item._id === matchId);
              const totalDue = form.totalDue || 0;
              setForm({
                ...form,
                matchId,
                participants: match ? createParticipantRows(matchId, totalDue || match.players.length * 50000) : [],
              });
            }}
          >
            <option value="">Chọn trận đấu</option>
            {availableMatches.map((match) => (
              <option key={match._id} value={match._id}>{match.matchName}</option>
            ))}
          </Select>
          <Input type="number" placeholder="Tổng cần đóng" value={form.totalDue} onChange={(event) => setForm((current) => ({
            ...current,
            totalDue: Number(event.target.value),
            participants: current.matchId ? createParticipantRows(current.matchId, Number(event.target.value)) : current.participants,
          }))} />
          <Input placeholder="Đơn vị tiền" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
          <Input placeholder="Ghi chú" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>

        <div className="mt-5 flex max-h-[50vh] flex-col rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-300">Cầu thủ tham gia</p>
            <p className="text-sm text-slate-400">{selectedMatch?.players.length || 0} cầu thủ</p>
          </div>
          <div className="grid gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            {(selectedMatch?.players || []).map((player, index) => {
              const row = form.participants[index] || { playerId: player._id, hasPaid: false, amount: 0 };
              return (
                <div key={player._id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{player.fullName}</p>
                      <p className="text-xs text-slate-400">#{player.jerseyNumber} · {player.position}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.participants[index]?.hasPaid || false}
                      onChange={(event) => setForm((current) => {
                        const next = [...current.participants];
                        next[index] = { ...row, playerId: player._id, hasPaid: event.target.checked };
                        return { ...current, participants: next };
                      })}
                    />
                  </div>
                  <Input
                    type="number"
                    className="mt-3"
                    value={row.amount}
                    onChange={(event) => setForm((current) => {
                      const next = [...current.participants];
                      next[index] = { ...row, playerId: player._id, amount: Number(event.target.value) };
                      return { ...current, participants: next };
                    })}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 mt-5 flex justify-end gap-3 rounded-2xl bg-slate-950/95 py-3 backdrop-blur-sm">
          <Button type="button" onClick={() => setModalOpen(false)} className="bg-white/10 text-white hover:bg-white/15">Hủy</Button>
          <Button type="button" onClick={savePayment} className="gap-2"><Save size={16} /> {editingPayment ? 'Cập nhật' : 'Tạo mới'}</Button>
        </div>
      </Modal>
    </div>
  );
};


