import { jest } from '@jest/globals';
import request from 'supertest';

// Mocks para modelos usados por transactions
const TransactionMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};
const DetailMock = {
    bulkCreate: jest.fn(),
    destroy: jest.fn()
};
await jest.unstable_mockModule('../../models/transaction.model.js', () => ({ default: TransactionMock }));
await jest.unstable_mockModule('../../models/detail_transaction.model.js', () => ({ default: DetailMock }));

const { default: app } = await import('../../app.js');

describe('Integration /api/transactions', () => {
    beforeEach(() => jest.clearAllMocks());

    test('POST /api/transactions should create transaction', async () => {
        const payload = { type: 'venta', date: new Date(), id_user: 1, total: 100, details: [] };
        TransactionMock.create.mockResolvedValue({ id_transaction: 1, ...payload });

        const res = await request(app).post('/api/transactions').send(payload);

        expect(res.status).toBe(201);
        expect(TransactionMock.create).toHaveBeenCalled();
    });

    test('GET /api/transactions should list transactions', async () => {
        TransactionMock.findAll.mockResolvedValue([{ id_transaction: 1 }]);
        const res = await request(app).get('/api/transactions');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id_transaction: 1 }]);
    });
});
