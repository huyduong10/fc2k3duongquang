import type { Request, Response } from 'express';
import { emitSocketEvent } from '../config/socket.js';
import { Payment } from '../models/Payment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populatePayment = () =>
  Payment.find()
    .populate('match')
    .populate('participants.player', 'fullName jerseyNumber position avatarUrl')
    .sort({ createdAt: -1 });

const normalizePayment = (payload: Record<string, unknown>) => {
  const participants = Array.isArray(payload.participants)
    ? payload.participants.map((participant) => ({
        ...participant,
        hasPaid: Boolean((participant as { hasPaid?: boolean }).hasPaid),
        amount: Number((participant as { amount?: number }).amount || 0),
        paidAt: (participant as { hasPaid?: boolean; paidAt?: Date | null }).hasPaid ? new Date() : null,
      }))
    : [];

  const totalCollected = participants.reduce((sum, participant) => sum + (participant.hasPaid ? participant.amount : 0), 0);
  const totalDue = Number(payload.totalDue || 0);
  const status = totalCollected >= totalDue ? 'paid' : totalCollected > 0 ? 'partial' : 'pending';

  return {
    ...payload,
    participants,
    totalDue,
    totalCollected,
    status,
    settlementDate: status === 'paid' ? new Date() : null,
  };
};

export const getPayments = asyncHandler(async (_req: Request, res: Response) => {
  const items = await populatePayment();
  res.json({ items });
});

export const getPublicPayments = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Payment.find()
    .populate('match', 'matchName matchDate opponent venue scoreFor scoreAgainst result')
    .populate('participants.player', 'fullName jerseyNumber position avatarUrl')
    .sort({ createdAt: -1 });

  const publicItems = items.map((payment) => {
    const paidCount = payment.participants.filter((participant) => participant.hasPaid).length;
    const unpaidCount = payment.participants.length - paidCount;

    return {
      _id: payment._id,
      match: payment.match,
      totalDue: payment.totalDue,
      totalCollected: payment.totalCollected,
      currency: payment.currency,
      status: payment.status,
      participants: payment.participants,
      paidCount,
      unpaidCount,
      remainingAmount: Math.max(payment.totalDue - payment.totalCollected, 0),
      settlementDate: payment.settlementDate,
      updatedAt: payment.updatedAt,
    };
  });

  res.json({ items: publicItems });
});

export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findById(req.params.id)
    .populate('match')
    .populate('participants.player', 'fullName jerseyNumber position avatarUrl');

  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }

  res.json(payment);
});

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.create(normalizePayment(req.body));
  emitSocketEvent('payments:updated', { action: 'created', paymentId: payment._id });
  res.status(201).json(payment);
});

export const updatePayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    normalizePayment(req.body),
    { new: true, runValidators: true },
  )
    .populate('match')
    .populate('participants.player', 'fullName jerseyNumber position avatarUrl');

  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }

  emitSocketEvent('payments:updated', { action: 'updated', paymentId: payment._id });
  res.json(payment);
});

export const deletePayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }

  emitSocketEvent('payments:updated', { action: 'deleted', paymentId: payment._id });
  res.json({ message: 'Payment removed' });
});
