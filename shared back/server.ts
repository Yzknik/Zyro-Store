import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust 1 proxy hop (Vercel/cloud)
app.disable('x-powered-by'); // Security: Hide server info
const PORT = Number(process.env.PORT || 80);

// Body parser middleware (must be before routes)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: ['https://zyrocheat.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // For easier dev, can be tightened
    crossOriginEmbedderPolicy: false
}));

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: 'Too many requests, slow down.' }
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Increased for admin dashboard with multiple data fetches
    message: { error: 'Limites de segurança atingidos. Tente novamente mais tarde.' }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // Keep stricter limit on auth endpoints
    message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' }
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', loginLimiter);
app.use(['/api/admin', '/api/launcher/payload', '/api/launcher/validate', '/api/payment/create', '/api/payment/manual-confirm'], strictLimiter);

// Default Route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Zyro Backend API (TypeScript) is running', version: '2.0.0-SECURED' });
});

// Import Routes with .js extension for ESM
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import launcherRoutes from './src/routes/launcherRoutes.js';
import * as launcherController from './src/controllers/launcherController.js';
import botRoutes from './src/routes/botRoutes.js';
import ticketRoutes from './src/routes/ticketRoutes.js';
import resellerRoutes from './src/routes/resellerRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.get('/api/version', launcherController.getLatestVersion);
app.use('/api/launcher', launcherRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reseller', resellerRoutes);
app.use('/api/payment', paymentRoutes);

app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Endpoint não encontrado.' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // SECURITY: Log privately, don't leak stack to user
    const errorId = Math.random().toString(36).substring(7).toUpperCase();
    console.error(`[SEC-LOG ${errorId}] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}: ${err.message}`);

    const isProd = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        error: 'SERVICE_ERROR',
        message: isProd ? 'Ocorreu um erro interno de segurança. Contate o administrador.' : err.message,
        ref: errorId
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Zyro Secure Backend running on port ${PORT}`);
});

// Vercel handler
export default app;
