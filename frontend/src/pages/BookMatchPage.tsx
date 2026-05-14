import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarDays, CheckCircle2, Clock3, Phone, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate } from '../lib/format';
import type { Booking } from '../types';

interface BookingFormState {
  teamName: string;
  contactPhone: string;
  contactFacebook: string;
  note: string;
}

interface CurrentBookingResponse {
  sundayDate: string;
  isBooked: boolean;
  booking: Booking | null;
}

const initialForm: BookingFormState = {
  teamName: '',
  contactPhone: '',
  contactFacebook: '',
  note: '',
};

const statusText = {
  pending: 'Đang chờ xác nhận',
  confirmed: 'Đã xác nhận',
  rejected: 'Bị từ chối',
} as const;

export const BookMatchPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<CurrentBookingResponse | null>(null);
  const [form, setForm] = useState<BookingFormState>(initialForm);

  const loadCurrentBooking = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/current');
      setState(response.data);
    } catch {
      toast.error('Không tải được trạng thái booking tuần này');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentBooking();
  }, []);

  const booking = state?.booking || null;
  const canCreateRequest = !booking || booking.status === 'rejected';

  const statusTone = useMemo(() => {
    if (!booking) return 'info';
    if (booking.status === 'confirmed') return 'success';
    if (booking.status === 'pending') return 'warning';
    return 'danger';
  }, [booking]);

  const submitBooking = async () => {
    if (!form.teamName.trim()) {
      toast.error('Vui lòng nhập tên đội.');
      return;
    }

    if (!form.contactPhone.trim() && !form.contactFacebook.trim()) {
      toast.error('Vui lòng nhập số điện thoại hoặc Facebook để liên hệ.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/bookings/public', {
        teamName: form.teamName,
        contactPhone: form.contactPhone,
        contactFacebook: form.contactFacebook,
        note: form.note,
      });
      toast.success('Đã gửi yêu cầu book. Chờ admin xác nhận.');
      setForm(initialForm);
      loadCurrentBooking();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Không thể gửi yêu cầu book.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-pitch-300/70">Book giao hữu Chủ nhật</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Đặt lịch đá với 2k3 DươngQuang</h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          Đội bạn gửi thông tin liên hệ để đặt lịch đá vào Chủ nhật tuần này lúc 18:00. Admin sẽ xác nhận trực tiếp trên dashboard.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel rounded-[2rem] p-6 shadow-glow">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-28" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                  <CalendarDays size={14} />
                  Chủ nhật tuần này: {formatDate(state?.sundayDate || new Date())} lúc 18:00
                </div>
                <Badge tone={statusTone as 'info' | 'success' | 'warning' | 'danger'}>
                  {booking ? statusText[booking.status] : 'Chưa có đội đặt'}
                </Badge>
              </div>

              {booking ? (
                <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <p className="text-base font-semibold text-white">Đội: {booking.teamName}</p>
                  <div className="mt-3 space-y-1 text-slate-300">
                    <p>Điện thoại: {booking.contactPhone || 'Không có'}</p>
                    <p>Facebook: {booking.contactFacebook || 'Không có'}</p>
                    <p>Ghi chú: {booking.note || 'Không có'}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-3xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-100">
                  Tuần này chưa có đội nào đặt lịch.
                </div>
              )}

              {booking?.status === 'confirmed' ? (
                <div className="mt-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={16} />
                    Đã có đội book cho Chủ nhật tuần này.
                  </div>
                </div>
              ) : booking?.status === 'pending' ? (
                <div className="mt-4 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock3 size={16} />
                    Đang có yêu cầu chờ admin xác nhận.
                  </div>
                </div>
              ) : booking?.status === 'rejected' ? (
                <div className="mt-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldAlert size={16} />
                    Yêu cầu trước đó đã bị từ chối. Bạn có thể gửi lại yêu cầu mới.
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section className="glass-panel rounded-[2rem] p-6 shadow-glow">
          <h3 className="text-xl font-semibold text-white">Gửi yêu cầu book</h3>
          <p className="mt-2 text-sm text-slate-400">
            Điền ít nhất một kênh liên hệ để đội mình gọi lại chốt lịch.
          </p>

          <div className="mt-5 space-y-3">
            <Input
              placeholder="Tên đội của bạn"
              value={form.teamName}
              onChange={(event) => setForm((current) => ({ ...current, teamName: event.target.value }))}
              disabled={!canCreateRequest || submitting}
            />
            <Input
              placeholder="Số điện thoại"
              value={form.contactPhone}
              onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))}
              disabled={!canCreateRequest || submitting}
            />
            <Input
              placeholder="Link Facebook / Messenger"
              value={form.contactFacebook}
              onChange={(event) => setForm((current) => ({ ...current, contactFacebook: event.target.value }))}
              disabled={!canCreateRequest || submitting}
            />
            <Input
              placeholder="Ghi chú thêm (sân, giờ mong muốn...)"
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              disabled={!canCreateRequest || submitting}
            />
          </div>

          <Button
            type="button"
            className="mt-5 w-full gap-2"
            onClick={submitBooking}
            disabled={!canCreateRequest || submitting}
          >
            <Phone size={16} />
            {submitting ? 'Đang gửi...' : 'Book đá Chủ nhật'}
          </Button>

          {!canCreateRequest ? (
            <p className="mt-3 text-center text-sm text-slate-400">
              Tuần này đã có đội book hoặc đang chờ xác nhận.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
};
