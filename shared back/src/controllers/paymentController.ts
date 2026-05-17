import type { Request, Response } from 'express';
import db from '../config/db.js';
import axios from 'axios';
import { generateLicenseKey } from '../utils/keyGen.js';
import { canAccessRole, syncDiscordAppRole } from '../utils/roles.js';

const PROMISSE_URL = 'https://api.promisse.com.br/transactions';
const WITHDRAW_URL = 'https://api.promisse.com.br/withdrawals';

const getWebhookSecret = () => {
    const secret = process.env.WEBHOOK_SECRET?.trim();
    return secret && secret.length >= 16 ? secret : null;
};

const isPrivilegedPaymentUser = (user: any) => {
    const role = String(user?.role || '').toUpperCase();
    return role === 'OWNER' || role === 'ADMIN' || user?.isAdmin === true;
};

const grantLicenseForPayment = async (payment: any) => {
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');
    if (payment.license_key) return payment.license_key;

    const plan: any = db.prepare('SELECT * FROM plans WHERE id = ?').get(payment.plan_id);
    if (!plan) throw new Error('PLAN_NOT_FOUND');

    const generatedLicenseKey = generateLicenseKey();
    const expiresAt = plan.duration_days > 0
        ? new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const tx = db.transaction(() => {
        const current: any = db.prepare('SELECT license_key FROM payments WHERE transaction_id = ?').get(payment.transaction_id);
        if (current?.license_key) return current.license_key;

        db.prepare('UPDATE payments SET status = "paid", license_key = ?, paid_at = datetime(\'now\') WHERE transaction_id = ?').run(generatedLicenseKey, payment.transaction_id);
        db.prepare(`
            INSERT INTO user_products (user_id, product_id, plan_id, license_key, expires_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(payment.user_id, plan.product_id, plan.id, generatedLicenseKey, expiresAt);

        return generatedLicenseKey;
    });

    const licenseKey = tx();
    const user: any = db.prepare('SELECT discord_id, role FROM users WHERE id = ?').get(payment.user_id);
    if (user) {
        if (String(user.role || '').toLowerCase() === 'user') {
            db.prepare("UPDATE users SET role = 'client' WHERE id = ?").run(payment.user_id);
            user.role = 'client';
        }
        await syncDiscordAppRole(user.discord_id, user.role || 'client');
    }

    return licenseKey;
};

export const createPayment = async (req: Request, res: Response) => {
    try {
        const { plan_id } = req.body;
        const user = (req as any).user;
        const SECRET_KEY = process.env.PROMISSE_SECRET_KEY;
        const webhookToken = getWebhookSecret();

        if (!SECRET_KEY) {
            console.error('[CRITICAL] PROMISSE_SECRET_KEY is missing in .env');
            return res.status(500).json({ error: 'PAYMENT_MISCONFIGURED' });
        }

        if (!webhookToken) {
            console.error('[CRITICAL] WEBHOOK_SECRET is missing or too short in .env');
            return res.status(500).json({ error: 'WEBHOOK_MISCONFIGURED' });
        }

        if (!plan_id) return res.status(400).json({ error: 'Plan ID is required' });

        const plan: any = db.prepare('SELECT p.*, prod.name as product_name, prod.sale_mode, prod.required_role FROM plans p JOIN products prod ON p.product_id = prod.id WHERE p.id = ?').get(plan_id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (String(plan.sale_mode || 'available').toLowerCase() === 'blocked') {
            return res.status(403).json({ error: 'SALE_BLOCKED', message: 'Esse produto ainda nao esta disponivel para venda.' });
        }
        if (!canAccessRole(user.role, plan.required_role)) {
            return res.status(403).json({ error: 'ROLE_REQUIRED', message: `Esse produto esta liberado apenas para ${String(plan.required_role || 'cargo autorizado').toUpperCase()}.` });
        }

        const amountInCents = Math.round(Number(plan.price) * 100);

        try {
            const response = await axios.post(PROMISSE_URL, {
                amount: amountInCents,
                webhook: `${process.env.BASE_URL || 'https://zyroapi.shardweb.app'}/api/payment/webhook?token=${webhookToken}`
            }, {
                headers: {
                    Authorization: SECRET_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            const data = response.data;
            const transaction_id = data.transaction?.id || data.id || data.transaction_id;
            const pixCode = data.pixCopiaECola || data.copyPaste || data.pixCode;
            const qrCodeBase64 = data.qrcode?.base64 || data.qrCodeBase64 || data.qrcode;

            if (!transaction_id) {
                console.error('[PAYMENT-ERROR] Missing transaction_id in gateway response');
                return res.status(500).json({
                    error: 'INVALID_GATEWAY_RESPONSE',
                    message: 'A API de pagamento nao retornou um ID de transacao valido.'
                });
            }

            db.prepare(`
                INSERT INTO payments (user_id, plan_id, transaction_id, amount, pix_copia_e_cola, qrcode_base64)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(user.id, plan_id, transaction_id, plan.price, pixCode || '', qrCodeBase64 || '');

            res.json({
                transaction_id,
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
        res.status(500).json({ error: 'INTERNAL_ERROR', message: process.env.NODE_ENV === 'production' ? 'SERVICE_ERROR' : error.message });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        const webhookSecret = getWebhookSecret();
        if (!webhookSecret || !token || token !== webhookSecret) {
            console.warn(`[SEC-WARNING] Unauthorized webhook attempt from IP: ${req.ip}`);
            return res.status(403).send('Forbidden');
        }

        const { id, status } = req.body;
        if (status === 'paid') {
            const payment: any = db.prepare('SELECT * FROM payments WHERE transaction_id = ?').get(id);
            if (payment) {
                const licenseKey = await grantLicenseForPayment(payment);
                console.log(`[Promisse] Payment ${id} confirmed. Key ${licenseKey} issued.`);
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
        const user = (req as any).user;

        const payment: any = db.prepare('SELECT * FROM payments WHERE transaction_id = ?').get(transaction_id);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        if (!isPrivilegedPaymentUser(user) && Number(payment.user_id) !== Number(user?.id)) {
            return res.status(403).json({ error: 'Payment not found' });
        }

        let status = payment.status;
        if (payment.status === 'pending' && SECRET_KEY) {
            try {
                const response = await axios.get(`${PROMISSE_URL}/${transaction_id}`, {
                    headers: { Authorization: SECRET_KEY }
                });

                const data = response.data;
                const apiStatus = data.transaction?.status || data.status;

                if (apiStatus === 'paid') {
                    await grantLicenseForPayment(payment);
                    status = 'paid';
                }
            } catch (pollErr: any) {
                console.error('[POLLING-ERROR] Failed to check status with gateway:', pollErr.message);
            }
        }

        res.json({ status });
    } catch (err: any) {
        res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'SERVICE_ERROR' : err.message });
    }
};

export const requestWithdrawal = async (req: Request, res: Response) => {
    try {
        const { amount, pixKey } = req.body;
        const user = (req as any).user;
        const SECRET_KEY = process.env.PROMISSE_SECRET_KEY;
        const webhookToken = getWebhookSecret();

        if (!SECRET_KEY) return res.status(500).json({ error: 'Configuracao de API ausente.' });
        if (!webhookToken) return res.status(500).json({ error: 'Configuracao de webhook ausente.' });
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Valor invalido.' });
        if (!pixKey) return res.status(400).json({ error: 'Chave PIX obrigatoria.' });

        const amountInCents = Math.round(Number(amount) * 100);

        if (String(user.role || '').toUpperCase() !== 'OWNER') {
            const userData: any = db.prepare('SELECT reseller_balance FROM users WHERE id = ?').get(user.id);
            if (!userData || userData.reseller_balance < amount) {
                return res.status(400).json({ error: 'Saldo insuficiente para saque.' });
            }
            db.prepare('UPDATE users SET reseller_balance = reseller_balance - ? WHERE id = ?').run(amount, user.id);
        }

        try {
            const response = await axios.post(WITHDRAW_URL, {
                amount: amountInCents,
                pixKey,
                webhook: `${process.env.BASE_URL || 'https://zyroapi.shardweb.app'}/api/payment/withdraw-webhook?token=${webhookToken}`
            }, {
                headers: {
                    Authorization: SECRET_KEY,
                    'Content-Type': 'application/json'
                }
            });

            const data = response.data;
            const withdrawId = data.withdrawal?.id || data.id;

            db.prepare(`
                INSERT INTO withdrawals (user_id, amount, pix_key, transaction_id, status)
                VALUES (?, ?, ?, ?, ?)
            `).run(user.id, amount, pixKey, withdrawId, 'processing');

            res.json({ success: true, message: 'Solicitacao de saque enviada com sucesso.', id: withdrawId });
        } catch (apiErr: any) {
            if (String(user.role || '').toUpperCase() !== 'OWNER') {
                db.prepare('UPDATE users SET reseller_balance = reseller_balance + ? WHERE id = ?').run(amount, user.id);
            }
            console.error('[WITHDRAW-ERROR]', apiErr.response?.data || apiErr.message);
            res.status(500).json({ error: 'Erro na API de Saque', details: apiErr.response?.data?.message || apiErr.message });
        }
    } catch (err: any) {
        res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'SERVICE_ERROR' : err.message });
    }
};

export const handleWithdrawalWebhook = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        const webhookSecret = getWebhookSecret();
        if (!webhookSecret || !token || token !== webhookSecret) {
            return res.status(403).send('Forbidden');
        }

        const { id, status } = req.body;
        console.log(`[WITHDRAW-WEBHOOK] Status update for ${id}: ${status}`);

        const withdrawal: any = db.prepare('SELECT * FROM withdrawals WHERE transaction_id = ?').get(id);
        if (!withdrawal) return res.status(404).send('Not Found');

        db.prepare('UPDATE withdrawals SET status = ? WHERE transaction_id = ?').run(status, id);

        if (status === 'failed') {
            const user: any = db.prepare('SELECT role FROM users WHERE id = ?').get(withdrawal.user_id);
            if (user && String(user.role || '').toUpperCase() !== 'OWNER') {
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
