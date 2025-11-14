import { Router } from 'express';
import { calculatePrintingPrice } from '../controllers/printing_price.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, calculatePrintingPrice);

export default router;
