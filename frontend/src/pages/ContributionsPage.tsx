import { useEffect, useMemo, useState } from 'react';
import { CircleDollarSign, Clock3, UserRoundCheck, UserRoundX } from 'lucide-react';
import { api } from '../lib/api';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../lib/format';
import type { PublicPayment } from '../types';

const getEffectiveTotalDue = (payment: PublicPayment) => {
  if (payment.totalDue > 0) {
    return payment.totalDue;
  }

  return payment.participants.reduce((sum, participant) => sum + Number(participant.amount || 0), 0);
};

export const ContributionsPage = () => {
  const [payments, setPayments] = useState<PublicPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get('/payments/public');
        setPayments(response.data.items || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(
    () =>
      payments.reduce(
        (accumulator, payment) => {
          accumulator.totalDue += getEffectiveTotalDue(payment);
          accumulator.totalCollected += payment.totalCollected;
          accumulator.totalUnpaid += payment.unpaidCount;
          return accumulator;
        },
        { totalDue: 0, totalCollected: 0, totalUnpaid: 0 },
      ),
    [payments],
  );

  const getParticipantName = (fullName?: string | null) => fullName?.trim() || 'Cau thu da roi doi';

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-pitch-300/70">Đóng góp sau trận</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Danh sách đóng tiền</h2>
        <p className="mt-3 max-w-3xl text-slate-300">
            ae đóng tiền đi
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-[1.75rem]" />)
        ) : (
          <>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-glow">
              <p className="text-sm text-slate-400">Tổng cần đóng</p>
              <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(summary.totalDue)}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-glow">
              <p className="text-sm text-slate-400">Tổng đã thu</p>
              <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(summary.totalCollected)}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-glow">
              <p className="text-sm text-slate-400">Người chưa đóng</p>
              <p className="mt-2 text-3xl font-semibold text-white">{summary.totalUnpaid}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 space-y-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-56 rounded-[2rem]" />)
        ) : payments.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-slate-300">
            Chưa có dữ liệu đóng tiền sau trận.
          </div>
        ) : (
          payments.map((payment) => {
            const unpaidPlayers = payment.participants.filter((participant) => !participant.hasPaid);
            const paidPlayers = payment.participants.filter((participant) => participant.hasPaid);

            return (
              <article key={payment._id} className="glass-panel rounded-[2rem] p-5 shadow-glow">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-2xl font-semibold text-white">{payment.match.matchName}</p>
                    <p className="mt-1 text-slate-300">vs {payment.match.opponent}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                        <Clock3 size={14} /> {formatDate(payment.match.matchDate)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                        <CircleDollarSign size={14} /> Còn thiếu {formatCurrency(payment.remainingAmount, payment.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge tone={payment.status === 'paid' ? 'success' : payment.status === 'partial' ? 'warning' : 'danger'}>
                      {payment.status}
                    </Badge>
                    <Badge tone="success">Đã đóng: {payment.paidCount}</Badge>
                    <Badge tone="danger">Chưa đóng: {payment.unpaidCount}</Badge>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="mb-3 flex items-center gap-2 text-emerald-200">
                      <UserRoundCheck size={16} />
                      <p className="font-medium">Đã đóng</p>
                    </div>
                    {paidPlayers.length === 0 ? (
                      <p className="text-sm text-emerald-100/80">Chưa có ai đóng.</p>
                    ) : (
                      <div className="space-y-2">
                        {paidPlayers.map((participant, index) => (
                          <div
                            key={`${payment._id}-paid-${participant.player?._id || 'unknown'}-${index}`}
                            className="flex items-center justify-between rounded-2xl border border-emerald-300/20 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-100"
                          >
                            <span>{getParticipantName(participant.player?.fullName)}</span>
                            <span>{formatCurrency(participant.amount, payment.currency)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4">
                    <div className="mb-3 flex items-center gap-2 text-rose-200">
                      <UserRoundX size={16} />
                      <p className="font-medium">Chưa đóng</p>
                    </div>
                    {unpaidPlayers.length === 0 ? (
                      <p className="text-sm text-rose-100/80">Tất cả đã đóng đủ.</p>
                    ) : (
                      <div className="space-y-2">
                        {unpaidPlayers.map((participant, index) => (
                          <div
                            key={`${payment._id}-unpaid-${participant.player?._id || 'unknown'}-${index}`}
                            className="flex items-center justify-between rounded-2xl border border-rose-300/20 bg-rose-900/20 px-3 py-2 text-sm text-rose-100"
                          >
                            <span>{getParticipantName(participant.player?.fullName)}</span>
                            <span>{formatCurrency(participant.amount, payment.currency)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
                  <p>
                    Đã thu {formatCurrency(payment.totalCollected, payment.currency)} / {formatCurrency(getEffectiveTotalDue(payment), payment.currency)}
                  </p>
                  <p>Cập nhật: {formatDate(payment.updatedAt)}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};