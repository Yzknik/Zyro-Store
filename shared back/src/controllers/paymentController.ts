import type { Request, Response } from 'express';
import db from '../config/db.js';
import axios from 'axios';
import { generateLicenseKey } from '../utils/keyGen.js';

const PROMISSE_URL = 'https://api.promisse.com.br/transactions';

export const createPayment = async (req: Request, res: Response) => {
    try {
        const { plan_id } = req.body;
        const user = (req as any).user;
        const SECRET_KEY = process.env.PROMISSE_SECRET_KEY;

        if (!SECRET_KEY) {
            console.error('[CRITICAL] PROMISSE_SECRET_KEY is missing in .env');
            return res.status(500).json({ error: 'Payment system misconfigured. Missing API Key.' });
        }

        if (!plan_id) return res.status(400).json({ error: 'Plan ID is required' });

        const plan: any = db.prepare('SELECT p.*, prod.name as product_name FROM plans p JOIN products prod ON p.product_id = prod.id WHERE p.id = ?').get(plan_id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const amountInCents = Math.round(plan.price * 100);

        console.log(`[PAYMENT-LOG] Creating transaction for user ${user.id}, Plan: ${plan.name}, Amount: ${amountInCents} cents`);

        // Promisse Pay requires amount in cents
        try {
            const webhookToken = process.env.WEBHOOK_SECRET || 'ZYRO-FALLBACK-SEC';
            const response = await axios.post(PROMISSE_URL, {
                amount: amountInCents,
                webhook: `${process.env.BASE_URL || 'https://zyroapi.shardweb.app'}/api/payment/webhook?token=${webhookToken}`
            }, {
                headers: {
                    'Authorization': SECRET_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10s timeout
            });

            const data = response.data;
            console.log('[PAYMENT-DEBUG] Response Data:', JSON.stringify(data, null, 2));

            // Handle both flat and nested structures from Promisse documentation
            const transaction_id = data.transaction?.id || data.id || data.transaction_id;
            const pixCode = data.pixCopiaECola || data.copyPaste || data.pixCode;
            const qrCodeBase64 = data.qrcode?.base64 || data.qrCodeBase64 || data.qrcode;

            if (!transaction_id) {
                console.error('[PAYMENT-ERROR] Missing transaction_id in response:', data);
                return res.status(500).json({
                    error: 'INVALID_GATEWAY_RESPONSE',
                    message: 'A API de pagamento não retornou um ID de transação válido.',
                    debug: data
                });
            }

            db.prepare(`
                INSERT INTO payments (user_id, plan_id, transaction_id, amount, pix_copia_e_cola, qrcode_base64)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(user.id, plan_id, transaction_id, plan.price, pixCode || '', qrCodeBase64 || '');

            res.json({
                transaction_id: transaction_id,
                pix_copia_e_cola: pixCode,
                qrcode_base64: qrCodeBase64
            });
        } catch (apiErr: any) {
            console.error('[PAYMENT-GATEWAY-ERROR]', apiErr.response?.data || apiErr.message);
            return res.status(apiErr.response?.status || 500).json({
                error: 'PAYMENT_GATEWAY_ERROR',
                message: apiErr.response?.data?.message || 'Gateway communication failed'
            });
        }

    } catch (error: any) {
        console.error('[INTERNAL-PAYMENT-ERROR]', error);
        res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        if (!token || token !== (process.env.WEBHOOK_SECRET || 'ZYRO-FALLBACK-SEC')) {
            console.warn(`[SEC-WARNING] Unauthorized webhook attempt from IP: ${req.ip}`);
            return res.status(403).send('Forbidden');
        }
        const { id, status } = req.body;

        if (status === 'paid') {
            const payment: any = db.prepare('SELECT * FROM payments WHERE transaction_id = ?').get(id);
            if (payment && payment.status === 'pending') {
                // 1. Update payment status
                db.prepare('UPDATE payments SET status = "paid" WHERE transaction_id = ?').run(id);

                // 2. Grant license
                const plan: any = db.prepare('SELECT * FROM plans WHERE id = ?').get(payment.plan_id);
                const licenseKey = generateLicenseKey();

                const expiresAt = plan.duration_days > 0
                    ? new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString()
                    : null;

                db.prepare(`
                    INSERT INTO user_products (user_id, product_id, plan_id, license_key, expires_at)
                    VALUES (?, ?, ?, ?, ?)
                `).run(payment.user_id, plan.product_id, plan.id, licenseKey, expiresAt);

                console.log(`✅ [Promisse] Payment ${id} confirmed. Key ${licenseKey} issued.`);
            }
        }

        res.status(200).send('OK');
    } catch (error: any) {
        console.error('Webhook processing error:', error.message);
        res.status(500).send('Error');
    }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
    try {
        const { transaction_id } = req.params;
        const SECRET_KEY = process.env.PROMISSE_SECRET_KEY;

        let payment: any = db.prepare('SELECT * FROM payments WHERE transaction_id = ?').get(transaction_id);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        // If still pending, poll the API as a fallback (useful if webhooks fail on localhost)
        if (payment.status === 'pending' && SECRET_KEY) {
            try {
                const response = await axios.get(`${PROMISSE_URL}/${transaction_id}`, {
                    headers: { 'Authorization': SECRET_KEY }
                });

                const data = response.data;
                const apiStatus = data.transaction?.status || data.status;

                if (apiStatus === 'paid') {
                    console.log(`[POLLING-FALLBACK] Payment ${transaction_id} confirmed via API poll.`);

                    // Grant license logic repeated here for fallback
                    db.prepare('UPDATE payments SET status = "paid" WHERE transaction_id = ?').run(transaction_id);
                    const plan: any = db.prepare('SELECT * FROM plans WHERE id = ?').get(payment.plan_id);
                    const licenseKey = generateLicenseKey();
                    const expiresAt = plan.duration_days > 0
                        ? new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString()
                        : null;

                    db.prepare(`
                        INSERT INTO user_products (user_id, product_id, plan_id, license_key, expires_at)
                        VALUES (?, ?, ?, ?, ?)
                    `).run(payment.user_id, plan.product_id, plan.id, licenseKey, expiresAt);

                    payment.status = 'paid';
                }
            } catch (pollErr: any) {
                console.error('[POLLING-ERROR] Failed to check status with gateway:', pollErr.message);
            }
        }

        res.json({ status: payment.status });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
const WITHDRAW_URL = 'https://api.promisse.com.br/withdrawals';

export const requestWithdrawal = async (req: Request, res: Response) => {
    try {
        const { amount, pixKey } = req.body; // Amount in BRL (real)
        const user = (req as any).user;
        const SECRET_KEY = process.env.PROMISSE_SECRET_KEY;

        if (!SECRET_KEY) return res.status(500).json({ error: 'Configuração de API ausente.' });
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Valor inválido.' });
        if (!pixKey) return res.status(400).json({ error: 'Chave PIX obrigatória.' });

        const amountInCents = Math.round(amount * 100);

        // Security: Check balance if not Owner
        if (user.role?.toUpperCase() !== 'OWNER') {
            const userData: any = db.prepare('SELECT reseller_balance FROM users WHERE id = ?').get(user.id);
            if (!userData || userData.reseller_balance < amount) {
                return res.status(400).json({ error: 'Saldo insuficiente para saque.' });
            }
            // Deduct balance immediately (reservation)
            db.prepare('UPDATE users SET reseller_balance = reseller_balance - ? WHERE id = ?').run(amount, user.id);
        }

        try {
            const webhookToken = process.env.WEBHOOK_SECRET || 'ZYRO-FALLBACK-SEC';
            const response = await axios.post(WITHDRAW_URL, {
                amount: amountInCents,
                pixKey: pixKey,
                webhook: `${process.env.BASE_URL || 'https://zyroapi.shardweb.app'}/api/payment/withdraw-webhook?token=${webhookToken}`
            }, {
                headers: {
                    'Authorization': SECRET_KEY,
                    'Content-Type': 'application/json'
                }
            });

            const data = response.data;
            const withdrawId = data.withdrawal?.id || data.id;

            db.prepare(`
                INSERT INTO withdrawals (user_id, amount, pix_key, transaction_id, status)
                VALUES (?, ?, ?, ?, ?)
            `).run(user.id, amount, pixKey, withdrawId, 'processing');

            res.json({ success: true, message: 'Solicitação de saque enviada com sucesso.', id: withdrawId });
        } catch (apiErr: any) {
            // Refund if reseller and API failed
            if (user.role?.toUpperCase() !== 'OWNER') {
                db.prepare('UPDATE users SET reseller_balance = reseller_balance + ? WHERE id = ?').run(amount, user.id);
            }
            console.error('[WITHDRAW-ERROR]', apiErr.response?.data || apiErr.message);
            res.status(500).json({ error: 'Erro na API de Saque', details: apiErr.response?.data?.message || apiErr.message });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const handleWithdrawalWebhook = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        if (!token || token !== (process.env.WEBHOOK_SECRET || 'ZYRO-FALLBACK-SEC')) {
            return res.status(403).send('Forbidden');
        }
        const { id, status } = req.body;
        console.log(`[WITHDRAW-WEBHOOK] Status update for ${id}: ${status}`);

        const withdrawal: any = db.prepare('SELECT * FROM withdrawals WHERE transaction_id = ?').get(id);
        if (!withdrawal) return res.status(404).send('Not Found');

        db.prepare('UPDATE withdrawals SET status = ? WHERE transaction_id = ?').run(status, id);

        // If it failed, refund the reseller
        if (status === 'failed') {
            const user: any = db.prepare('SELECT role FROM users WHERE id = ?').get(withdrawal.user_id);
            if (user && user.role?.toUpperCase() !== 'OWNER') {
                db.prepare('UPDATE users SET reseller_balance = reseller_balance + ? WHERE id = ?').run(withdrawal.amount, withdrawal.user_id);
                console.log(`[WITHDRAW-REFUND] Refunded ${withdrawal.amount} to user ${withdrawal.user_id} due to failure.`);
            }
        }

        res.status(200).send('OK');
    } catch (err: any) {
        console.error('[WITHDRAW-WH-ERROR]', err.message);
        res.status(500).send('Error');
    }
};
