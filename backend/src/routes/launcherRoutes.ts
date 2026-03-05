import express from 'express';
import * as launcherController from '../controllers/launcherController.js';

const router = express.Router();

router.get('/version', launcherController.getLatestVersion);
router.post('/validate', launcherController.validateProduct);
router.post('/heartbeat', launcherController.heartbeat);
router.post('/integrity', launcherController.checkIntegrity);

export default router;
