import { Router } from 'express';
import { assignPrinterToPrint } from '../controllers/print.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.put('/:id/printer', authMiddleware, assignPrinterToPrint);

export default router;
