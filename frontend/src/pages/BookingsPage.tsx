import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarDays, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate } from '../lib/format';
import type { Booking, BookingStatus } from '../types';

const statusLabel: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  rejected: 'Từ chối',
};

const statusTone: Record<BookingStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  confirmed: 'success',
  rejected: 'danger',
};

export const BookingsPage = () => {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings');
      setItems(response.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const refresh = () => loadData();
    socket.on('bookings:updated', refresh);
    return () => {
      socket.off('bookings:updated', refresh);
    };
  }, []);

  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, {
        status,
        adminNote: adminNote[bookingId] || '',
      });
      toast.success('Đã cập nhật trạng thái booking');
      loadData();
    } catch {
      toast.error('Không thể cập nhật trạng thái booking');
    }
  };

  const summary = useMemo(() => {
    const pending = items.filter((item) => item.status === 'pending').length;
    const confirmed = items.filter((item) => item.status === 'confirmed').length;
    const rejected = items.filter((item) => item.status === 'rejected').length;
    return { pending, confirmed, rejected };
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-pitch-300/70">Book đối thủ</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Xác nhận kèo Chủ nhật</h1>
        <p className="mt-2 text-sm text-slate-400">
          Quản trị yêu cầu từ các đội khác: duyệt kèo, từ chối hoặc ghi chú thêm để liên hệ.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Chờ xác nhận</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary.pending}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Đã xác nhận</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary.confirmed}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5 shadow-glow">
          <p className="text-sm text-slate-400">Đã từ chối</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary.rejected}</p>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-4 shadow-glow">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
            Chưa có yêu cầu book nào.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((booking) => (
              <article key={booking._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{booking.teamName}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-300">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1">
                        <CalendarDays size={14} /> Chủ nhật: {formatDate(booking.sundayDate)} lúc 18:00
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1">
                        <Clock3 size={14} /> Tạo lúc: {formatDate(booking.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Badge tone={statusTone[booking.status]}>{statusLabel[booking.status]}</Badge>
                </div>

                <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-slate-950/30 p-3 text-sm text-slate-200">
                  <p>Điện thoại: {booking.contactPhone || 'Không có'}</p>
                  <p>Facebook: {booking.contactFacebook || 'Không có'}</p>
                  <p>Ghi chú đội bạn: {booking.note || 'Không có'}</p>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                  <Input
                    placeholder="Ghi chú từ admin"
                    value={adminNote[booking._id] ?? booking.adminNote ?? ''}
                    onChange={(event) =>
                      setAdminNote((current) => ({
                        ...current,
                        [booking._id]: event.target.value,
                      }))
                    }
                  />

                  <Button
                    type="button"
                    className="gap-2"
                    onClick={() => updateStatus(booking._id, 'confirmed')}
                    disabled={booking.status === 'confirmed'}
                  >
                    <CheckCircle2 size={16} />
                    Xác nhận
                  </Button>

                  <Button
                    type="button"
                    className="gap-2 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                    onClick={() => updateStatus(booking._id, 'rejected')}
                    disabled={booking.status === 'rejected'}
                  >
                    <XCircle size={16} />
                    Từ chối
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
