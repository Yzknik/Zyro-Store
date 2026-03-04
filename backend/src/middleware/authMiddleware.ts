import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

export const verifyAdmin = (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.discord_id) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    // Checking database directly to allow real-time permission updates
    const isActuallyAdmin = User.isAdmin(req.user.discord_id);

    if (!isActuallyAdmin) {
        return res.status(403).json({ error: 'Permission denied. Admins only.' });
    }

    next();
};

export const verifyBotToken = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.BOT_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized Bot Access' });
    }
    next();
};
