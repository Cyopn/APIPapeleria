import { Router } from 'express';
import { createProduct, listProducts, listProductsByType, getProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, createProduct);
router.get('/', authMiddleware, listProducts);
router.get('/type/:type', authMiddleware, listProductsByType);
router.get('/:id', authMiddleware, getProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
