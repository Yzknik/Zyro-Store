import express from 'express';
import * as ticketController from '../controllers/ticketController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', verifyToken, ticketController.createTicket);
router.get('/my', verifyToken, ticketController.listMyTickets);
router.get('/:id', verifyToken, ticketController.getTicketDetails);
router.post('/:id/reply', verifyToken, ticketController.replyTicket);
router.post('/:id/close', verifyToken, ticketController.closeTicket);

// Admin only (managed inside controller check)
const { verifyAdmin } = await import('../middleware/authMiddleware.js');
router.get('/admin/list', verifyToken, verifyAdmin, ticketController.listAllTickets);

export default router;
