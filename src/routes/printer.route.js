import { Router } from 'express';
import { createPrinter, listPrinters, getPrinter, updatePrinter, deletePrinter } from '../controllers/printer.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, createPrinter);
router.get('/', authMiddleware, listPrinters);
router.get('/:id', authMiddleware, getPrinter);
router.put('/:id', authMiddleware, updatePrinter);
router.delete('/:id', authMiddleware, deletePrinter);

export default router;
