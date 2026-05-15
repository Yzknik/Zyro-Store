import express from 'express';
import * as botController from '../controllers/botController.js';
import { verifyBotToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyBotToken);

router.post('/activate-plan', botController.activatePlan);
router.get('/user/:discord_id', botController.getUserInfo);

export default router;
