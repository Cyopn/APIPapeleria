import { jest } from '@jest/globals';

const ProductMock = {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};

const PrintMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};

const ItemMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};

await jest.unstable_mockModule('../models/product.model.js', () => ({ default: ProductMock }));
await jest.unstable_mockModule('../models/print.model.js', () => ({ default: PrintMock }));
await jest.unstable_mockModule('../models/item.model.js', () => ({ default: ItemMock }));

const { default: productService } = await import('../services/product.service.js');

describe('Product Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('create item product branch', async () => {
        const input = { id: null, type: 'item', description: 'desc', price: 10, name: 'P1' };
        ItemMock.findOne.mockResolvedValue(null);
        ProductMock.create.mockResolvedValue({ id_product: 50, type: 'item', description: input.description, price: input.price });
        ItemMock.create.mockResolvedValue({ id_item: 50, name: input.name });

        const res = await productService.create(input);

        expect(ItemMock.findOne).toHaveBeenCalledWith({ where: { name: input.name } });
        expect(ProductMock.create).toHaveBeenCalled();
        expect(ItemMock.create).toHaveBeenCalledWith({ id_item: 50, name: input.name });
        expect(res).toHaveProperty('id_item', 50);
    });

    test('create print product branch', async () => {
        const input = { id: null, type: 'print', description: 'desc', price: 20, type_print: 'A4', type_paper: 'gloss' };
        PrintMock.findOne.mockResolvedValue(null);
        ProductMock.create.mockResolvedValue({ id_product: 60, type: 'print', description: input.description, price: input.price });
        PrintMock.create.mockResolvedValue({ id_print: 60, type_print: input.type_print, type_paper: input.type_paper });

        const res = await productService.create(input);

        expect(PrintMock.findOne).toHaveBeenCalledWith({ where: { type_print: input.type_print } });
        expect(ProductMock.create).toHaveBeenCalled();
        expect(PrintMock.create).toHaveBeenCalledWith({ id_print: 60, type_print: input.type_print, type_paper: input.type_paper });
        expect(res).toHaveProperty('id_item', 60);
    });

    test('findAll should return collections', async () => {
        PrintMock.findAll.mockResolvedValue([{ id_print: 1 }]);
        ItemMock.findAll.mockResolvedValue([{ id_item: 2 }]);
        ProductMock.findAll.mockResolvedValue([{ id_product: 3 }]);

        const res = await productService.findAll();
        expect(res).toHaveProperty('prints');
        expect(res).toHaveProperty('items');
        expect(res).toHaveProperty('products');
    });

    test('update should throw if product not found', async () => {
        ProductMock.findByPk.mockResolvedValue(null);
        await expect(productService.update(999, {})).rejects.toThrow('El producto no existe');
    });

    test('remove should delete associated records and product', async () => {
        ProductMock.destroy.mockResolvedValue(1);
        ItemMock.destroy.mockResolvedValue(1);
        PrintMock.destroy.mockResolvedValue(1);

        const res = await productService.remove(10);
        expect(ProductMock.destroy).toHaveBeenCalledWith({ where: { id_product: 10 } });
        expect(res).toHaveProperty('message', 'Producto eliminado');
    });
});
