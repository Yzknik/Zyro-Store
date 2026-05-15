import type { Request, Response } from 'express';
import db from '../config/db.js';
import User from '../models/userModel.js';

export const createTicket = async (req: any, res: Response) => {
    try {
        const { subject, message } = req.body;
        const user = User.findByDiscordId(req.user.discord_id) as any;

        const ticketId = db.prepare('INSERT INTO support_tickets (user_id, subject) VALUES (?, ?)').run(user.id, subject).lastInsertRowid;
        db.prepare('INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin) VALUES (?, ?, ?, 0)').run(ticketId, user.id, message);

        res.status(201).json({ success: true, ticketId });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const listMyTickets = async (req: any, res: Response) => {
    try {
        const user = User.findByDiscordId(req.user.discord_id) as any;
        const tickets = db.prepare('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
        res.json(tickets);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getTicketDetails = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const user = User.findByDiscordId(req.user.discord_id) as any;

        const ticket: any = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Only owner or admin can see ticket messages
        if (ticket.user_id !== user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const messages = db.prepare('SELECT tm.*, u.username, u.avatar FROM ticket_messages tm LEFT JOIN users u ON tm.user_id = u.id WHERE tm.ticket_id = ? ORDER BY tm.created_at ASC').all(id);
        res.json({ ticket, messages });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const replyTicket = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const user = User.findByDiscordId(req.user.discord_id) as any;

        const ticket: any = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        if (ticket.user_id !== user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        db.prepare('INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin) VALUES (?, ?, ?, ?)').run(id, user.id, message, req.user.isAdmin ? 1 : 0);

        // If admin replies, we can mark as "updated" or something, here just keeping it simple
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const closeTicket = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const user = User.findByDiscordId(req.user.discord_id) as any;

        const ticket: any = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        if (ticket.user_id !== user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        db.prepare('UPDATE support_tickets SET status = "closed" WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const listAllTickets = async (req: any, res: Response) => {
    try {
        if (!req.user.isAdmin) return res.status(403).json({ error: 'Unauthorized' });
        const tickets = db.prepare('SELECT t.*, u.username FROM support_tickets t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC').all();
        res.json(tickets);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
