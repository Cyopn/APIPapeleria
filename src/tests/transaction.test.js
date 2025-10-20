import { jest } from '@jest/globals';

// Usamos la API de mock de ESM de Jest y luego import dinámicamente el servicio
const TransactionMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};

const DetailTransactionMock = {
    bulkCreate: jest.fn(),
    destroy: jest.fn()
};

await jest.unstable_mockModule('../models/transaction.model.js', () => ({ default: TransactionMock }));
await jest.unstable_mockModule('../models/detail_transaction.model.js', () => ({ default: DetailTransactionMock }));

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
        DetailTransactionMock.bulkCreate.mockResolvedValue([{}, {}]);

        const result = await transactionService.create(input);

        expect(TransactionMock.create).toHaveBeenCalledWith({ type: input.type, date: input.date, id_user: input.id_user, total: input.total });
        expect(DetailTransactionMock.bulkCreate).toHaveBeenCalledWith([
            { id_transaction: 123, id_product: 1, amount: 2, price: 20 },
            { id_transaction: 123, id_product: 2, amount: 1, price: 60 }
        ]);
        expect(result).toHaveProperty('id_transaction', 123);
    });

    test('findAll should call Transaction.findAll with include', async () => {
        TransactionMock.findAll.mockResolvedValue([{ id_transaction: 1 }]);
        const res = await transactionService.findAll();
        expect(TransactionMock.findAll).toHaveBeenCalled();
        expect(res).toEqual([{ id_transaction: 1 }]);
    });
});
