import { Router } from 'express';
import {
  createPublicBooking,
  getBookings,
  getCurrentWeekBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/current', getCurrentWeekBooking);
router.post('/public', createPublicBooking);
router.get('/', protect, getBookings);
router.patch('/:id/status', protect, updateBookingStatus);

export default router;
