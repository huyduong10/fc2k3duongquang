import { Router } from 'express';
import {
  createMatch,
  deleteMatch,
  getMatchById,
  getMatches,
  updateMatch,
} from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getMatches);
router.get('/:id', getMatchById);
router.post('/', protect, createMatch);
router.put('/:id', protect, updateMatch);
router.delete('/:id', protect, deleteMatch);

export default router;
