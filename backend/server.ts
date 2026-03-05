import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.disable('x-powered-by'); // Security: Hide server info
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // For easier dev, can be tightened
    crossOriginEmbedderPolicy: false
}));
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '5mb' })); // DDoS prevention: Payload size limit
app.use(cookieParser());

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: 'Too many requests, slow down.' }
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // Stricter for production
    message: { error: 'Limites de segurança atingidos. Tente novamente mais tarde.' }
});

app.use('/api/', globalLimiter);
app.use(['/api/auth/login', '/api/admin', '/api/launcher/payload', '/api/launcher/validate', '/api/payment/create', '/api/payment/manual-confirm'], strictLimiter);

// Default Route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Zyro Backend API (TypeScript) is running', version: '2.0.0-SECURED' });
});

// Import Routes with .js extension for ESM
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import launcherRoutes from './src/routes/launcherRoutes.js';
import botRoutes from './src/routes/botRoutes.js';
import ticketRoutes from './src/routes/ticketRoutes.js';
import resellerRoutes from './src/routes/resellerRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/launcher', launcherRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reseller', resellerRoutes);
app.use('/api/payment', paymentRoutes);

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
