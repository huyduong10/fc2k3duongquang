import { Router } from 'express';
import {
  createPlayer,
  deletePlayer,
  getPlayerById,
  getPlayers,
  updatePlayer,
} from '../controllers/playerController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getPlayers);
router.get('/:id', getPlayerById);
router.post('/', protect, createPlayer);
router.put('/:id', protect, updatePlayer);
router.delete('/:id', protect, deletePlayer);

export default router;
