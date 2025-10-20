import { jest } from '@jest/globals';

const PayamentMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};

await jest.unstable_mockModule('../models/payament_method.model.js', () => ({ default: PayamentMock }));
const { default: payamentService } = await import('../services/payament_method.service.js');

describe('PayamentMethod Service', () => {
    beforeEach(() => jest.clearAllMocks());

    test('create should create payament method when not exists', async () => {
        const input = { type: 'card' };
        PayamentMock.findOne.mockResolvedValue(null);
        PayamentMock.create.mockResolvedValue({ id_payament_method: 5, type: input.type });

        const res = await payamentService.create(input);
        expect(PayamentMock.findOne).toHaveBeenCalledWith({ where: { type: input.type } });
        expect(PayamentMock.create).toHaveBeenCalledWith({ type: input.type });
        expect(res).toHaveProperty('type', input.type);
    });

    test('findAll should return list', async () => {
        PayamentMock.findAll.mockResolvedValue([{ id_payament_method: 1 }]);
        const res = await payamentService.findAll();
        expect(res).toEqual([{ id_payament_method: 1 }]);
    });

    test('update should throw if not found', async () => {
        PayamentMock.findByPk.mockResolvedValue(null);
        await expect(payamentService.update(999, { type: 'x' })).rejects.toThrow('Metodo de pago no encontrado');
    });

    test('remove should delete and return message', async () => {
        PayamentMock.destroy.mockResolvedValue(1);
        const res = await payamentService.remove(3);
        expect(PayamentMock.destroy).toHaveBeenCalledWith({ where: { id_payament_method: 3 } });
        expect(res).toHaveProperty('message', 'Metodo de pago eliminado');
    });
});
