import type { Request, Response } from 'express';
import { Booking, type BookingStatus } from '../models/Booking.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { emitSocketEvent } from '../config/socket.js';

const getUpcomingSundaySlot = (baseDate = new Date()) => {
  const sunday = new Date(baseDate);
  const day = sunday.getDay();
  const daysUntilSunday = (7 - day) % 7;
  sunday.setDate(sunday.getDate() + daysUntilSunday);
  sunday.setHours(18, 0, 0, 0);
  return sunday;
};

const getSundayWindow = (slotDate: Date) => {
  const start = new Date(slotDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(slotDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const activeStatuses: BookingStatus[] = ['pending', 'confirmed'];

export const getCurrentWeekBooking = asyncHandler(async (_req: Request, res: Response) => {
  const sundayDate = getUpcomingSundaySlot();
  const sundayWindow = getSundayWindow(sundayDate);

  const booking = await Booking.findOne({
    sundayDate: {
      $gte: sundayWindow.start,
      $lte: sundayWindow.end,
    },
    status: { $in: activeStatuses },
  }).sort({ createdAt: -1 });

  res.json({
    sundayDate,
    isBooked: Boolean(booking && booking.status === 'confirmed'),
    booking,
  });
});

export const createPublicBooking = asyncHandler(async (req: Request, res: Response) => {
  const sundayDate = getUpcomingSundaySlot();
  const sundayWindow = getSundayWindow(sundayDate);
  const teamName = String(req.body.teamName || '').trim();
  const contactPhone = String(req.body.contactPhone || '').trim();
  const contactFacebook = String(req.body.contactFacebook || '').trim();
  const note = String(req.body.note || '').trim();

  if (!teamName) {
    res.status(400).json({ message: 'Vui long nhap ten doi bong.' });
    return;
  }

  if (!contactPhone && !contactFacebook) {
    res.status(400).json({ message: 'Vui long nhap so dien thoai hoac Facebook de lien he.' });
    return;
  }

  const existing = await Booking.findOne({
    sundayDate: {
      $gte: sundayWindow.start,
      $lte: sundayWindow.end,
    },
    status: { $in: activeStatuses },
  }).sort({ createdAt: -1 });

  if (existing) {
    res.status(409).json({
      message:
        existing.status === 'confirmed'
          ? 'Tuan nay da co doi dat lich da. Vui long book tuan tiep theo.'
          : 'Da co yeu cau dang cho admin xac nhan cho chu nhat tuan nay.',
    });
    return;
  }

  const booking = await Booking.create({
    teamName,
    sundayDate,
    contactPhone,
    contactFacebook,
    note,
    status: 'pending',
  });

  emitSocketEvent('bookings:updated', { action: 'created', bookingId: booking._id });

  res.status(201).json(booking);
});

export const getBookings = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Booking.find().sort({ sundayDate: -1, createdAt: -1 });
  res.json({ items });
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = String(req.body.status || '') as BookingStatus;
  const adminNote = String(req.body.adminNote || '').trim();

  if (!['pending', 'confirmed', 'rejected'].includes(status)) {
    res.status(400).json({ message: 'Trang thai khong hop le.' });
    return;
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404).json({ message: 'Booking not found' });
    return;
  }

  booking.status = status;
  booking.adminNote = adminNote;
  booking.confirmedAt = status === 'confirmed' ? new Date() : null;

  await booking.save();

  emitSocketEvent('bookings:updated', { action: 'status', bookingId: booking._id, status: booking.status });

  res.json(booking);
});
