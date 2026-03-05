import express from 'express';
import * as authController from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/discord', authController.discordLogin);
router.get('/discord/callback', authController.discordCallback);
router.get('/logout', authController.logout);
router.get('/me', verifyToken, authController.getMe);
router.post('/login', authController.login);
router.post('/finalize', verifyToken, authController.finalizeAccount);
router.post('/reset-hwid', verifyToken, authController.resetHWID); // Changed path from /hwid/reset to /reset-hwid
router.post('/license/toggle', verifyToken, authController.toggleLicenseStatus);
router.post('/config/save', verifyToken, authController.saveUserConfig);
router.get('/configs/:product_id', verifyToken, authController.getUserConfigs);
router.get('/history', verifyToken, authController.getLoginHistory);

export default router;
