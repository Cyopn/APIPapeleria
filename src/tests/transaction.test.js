import { jest } from '@jest/globals';

const TransactionMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};

const DetailTransactionMock = {
    create: jest.fn(),
    bulkCreate: jest.fn(),
    destroy: jest.fn()
};

await jest.unstable_mockModule('../models/transaction.model.js', () => ({ default: TransactionMock }));
await jest.unstable_mockModule('../models/detail_transaction.model.js', () => ({ default: DetailTransactionMock }));

await jest.unstable_mockModule('../models/product.model.js', () => ({ default: {} }));

await jest.unstable_mockModule('../config/db.js', () => ({
    default: { transaction: jest.fn().mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() }) }
}));

const { default: transactionService } = await import('../services/transaction.service.js');

describe('Transaction Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('create should create transaction and details', async () => {
        const input = {
            type: 'venta',
            date: new Date(),
            id_user: 1,
            total: 100,
            details: [
                { id_product: 1, amount: 2, price: 20 },
                { id_product: 2, amount: 1, price: 60 }
            ]
        };

        TransactionMock.create.mockResolvedValue({ id_transaction: 123, ...input });
        DetailTransactionMock.create.mockResolvedValue({});

        const result = await transactionService.create(input);

        expect(TransactionMock.create).toHaveBeenCalledWith({ type: input.type, date: input.date, id_user: input.id_user, total: input.total }, { transaction: expect.any(Object) });
        expect(DetailTransactionMock.create).toHaveBeenCalledTimes(2);
        expect(DetailTransactionMock.create).toHaveBeenNthCalledWith(1, { id_transaction: 123, id_product: 1, amount: 2, price: 20 }, { transaction: expect.any(Object) });
        expect(DetailTransactionMock.create).toHaveBeenNthCalledWith(2, { id_transaction: 123, id_product: 2, amount: 1, price: 60 }, { transaction: expect.any(Object) });
        expect(result).toHaveProperty('id_transaction', 123);
    });

    test('findAll should call Transaction.findAll with include', async () => {
        TransactionMock.findAll.mockResolvedValue([{ id_transaction: 1 }]);
        const res = await transactionService.findAll();
        expect(TransactionMock.findAll).toHaveBeenCalled();
        expect(res).toEqual([{ id_transaction: 1 }]);
    });
});
