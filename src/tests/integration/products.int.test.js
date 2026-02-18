import { jest } from '@jest/globals';
import request from 'supertest';

const ProductMock = { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(), update: jest.fn(), destroy: jest.fn() };
const PrintMock = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), destroy: jest.fn() };
const ItemMock = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), destroy: jest.fn() };

await jest.unstable_mockModule('../../models/product.model.js', () => ({ default: ProductMock }));
await jest.unstable_mockModule('../../models/print.model.js', () => ({ default: PrintMock }));
await jest.unstable_mockModule('../../models/item.model.js', () => ({ default: ItemMock }));

import env from '../../config/env.js';
import jwt from 'jsonwebtoken';
const token = jwt.sign({ test: true }, env.JWT_SECRET);
const { default: app } = await import('../../app.js');

describe('Integration /api/products', () => {
    beforeEach(() => jest.clearAllMocks());

    test('POST /api/products should create product', async () => {
        const payload = { type: 'item', description: 'd', price: 10, name: 'n' };
        ItemMock.findOne.mockResolvedValue(null);
        ProductMock.create.mockResolvedValue({ id_product: 2, type: 'item' });
        ItemMock.create.mockResolvedValue({ id_item: 2, name: 'n' });

        const res = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send(payload);
        expect(res.status).toBe(201);
        expect(ProductMock.create).toHaveBeenCalled();
    });

    test('GET /api/products should list products', async () => {
        PrintMock.findAll.mockResolvedValue([{ id_print: 1 }]);
        ItemMock.findAll.mockResolvedValue([{ id_item: 2 }]);
        ProductMock.findAll.mockResolvedValue([{ id_product: 3 }]);

        const res = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('prints');
    });
});
