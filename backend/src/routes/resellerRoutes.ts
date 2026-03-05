import { Router } from 'express';
import { getResellerStats, buyKey } from '../controllers/resellerController.js';
import { verifyToken, verifyReseller } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyToken, verifyReseller);

router.get('/stats', getResellerStats);
router.post('/buy', buyKey);

export default router;
