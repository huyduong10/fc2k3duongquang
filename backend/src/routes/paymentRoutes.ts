import { Router } from 'express';
import {
  createPayment,
  deletePayment,
  getPaymentById,
  getPayments,
  getPublicPayments,
  updatePayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/public', getPublicPayments);
router.get('/', protect, getPayments);
router.get('/:id', protect, getPaymentById);
router.post('/', protect, createPayment);
router.put('/:id', protect, updatePayment);
router.delete('/:id', protect, deletePayment);

export default router;
