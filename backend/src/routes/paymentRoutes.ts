import express from 'express';
import { createPayment, handleWebhook, getPaymentStatus, requestWithdrawal, handleWithdrawalWebhook } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Webhook doesn't need auth, PromissePay calls it
router.post('/webhook', handleWebhook);

// User endpoints
router.post('/create', verifyToken, createPayment);
router.get('/status/:transaction_id', verifyToken, getPaymentStatus);

// Withdraw endpoints (Resellers/Admins)
router.post('/withdraw', verifyToken, requestWithdrawal);
router.post('/withdraw-webhook', handleWithdrawalWebhook);

export default router;
