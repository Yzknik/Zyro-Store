import express from 'express';
import type { Request, Response } from 'express';
import Product from '../models/productModel.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    try {
        const products = Product.getAll();
        res.json(products);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id/plans', (req: Request, res: Response) => {
    try {
        const plans = Product.getPlans(req.params.id as string);
        res.json(plans);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
