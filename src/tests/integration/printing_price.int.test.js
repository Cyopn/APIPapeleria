import { jest } from '@jest/globals';
import request from 'supertest';

await jest.unstable_mockModule('../../services/printing_price.service.js', () => ({
    default: { calculateFromStoredFile: jest.fn().mockResolvedValue(7.25) }
}));

import env from '../../config/env.js';
import jwt from 'jsonwebtoken';
const token = jwt.sign({ test: true }, env.JWT_SECRET);
const { default: app } = await import('../../app.js');
const printingPriceServiceMock = (await import('../../services/printing_price.service.js')).default;

describe('Integration /api/printing-price', () => {
    beforeEach(() => jest.clearAllMocks());

    test('POST /api/printing-price should return price for stored file', async () => {
        const payload = { filename: 'stored-file.pdf', service: 'general' };
        const res = await request(app).post('/api/printing-price').set('Authorization', `Bearer ${token}`).send(payload);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('price', 7.25);
        expect(printingPriceServiceMock.calculateFromStoredFile).toHaveBeenCalledWith('stored-file.pdf', 'general');
    });

    test('POST /api/printing-price without filename should return 400', async () => {
        const res = await request(app).post('/api/printing-price').set('Authorization', `Bearer ${token}`).send({});
        expect(res.status).toBe(400);
    });

    test('POST /api/printing-price without auth should return 401', async () => {
        const res = await request(app).post('/api/printing-price').send({ filename: 'a.pdf' });
        expect(res.status).toBe(401);
    });
});
