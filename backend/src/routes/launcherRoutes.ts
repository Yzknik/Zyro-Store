import express from 'express';
import * as launcherController from '../controllers/launcherController.js';

const router = express.Router();

router.get('/version', launcherController.getLatestVersion);
router.post('/validate', launcherController.validateProduct);

export default router;
