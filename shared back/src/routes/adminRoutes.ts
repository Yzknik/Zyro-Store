import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/binaries');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const router = express.Router();

// Public info for Homepage and Dashboard
router.get('/info', adminController.getPublicInfo);

router.use(verifyToken);

// Admin-only routes
router.use(verifyAdmin);

// Categories
router.get('/categories', adminController.listCategories);
router.post('/categories', adminController.createCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Products
router.post('/products', adminController.createProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Plans
router.post('/plans', adminController.createPlan);
router.delete('/plans/:id', adminController.deletePlan);

// Licenses
router.get('/licenses', adminController.listLicenses);
router.post('/assign', adminController.assignProduct);
router.patch('/licenses/:id/status', adminController.updateLicenseStatus);
router.delete('/licenses/:id', adminController.deleteLicense);

// Moderators
router.get('/moderators', adminController.listModerators);
router.post('/moderators', adminController.addModerator);
router.delete('/moderators/:id', adminController.removeModerator);

// Stats & Management
router.get('/stats', adminController.getStats);

// News
router.get('/news', adminController.listNews);
router.post('/news', adminController.createNews);
router.delete('/news/:id', adminController.deleteNews);

// Settings
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSetting);

// Logs
router.get('/logs', adminController.getSystemLogs);

// Pull Members
router.post('/pull-members', adminController.pullDiscordMembers);

// Launcher Versions / Updates
router.get('/versions', adminController.listVersions);
router.post('/versions', upload.single('binary'), adminController.createVersion);
router.delete('/versions/:id', adminController.deleteVersion);

// Launcher Main Version Management
router.get('/launcher-version', adminController.getLauncherVersion);
router.post('/launcher-version', adminController.updateLauncherVersion);

// Users & Resellers
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.post('/users/:id/set-reseller-balance', adminController.setResellerBalance);
router.post('/users/:id/reseller-balance', adminController.addResellerBalance);

export default router;
