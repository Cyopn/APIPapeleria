import { jest } from '@jest/globals';

await jest.unstable_mockModule('../services/file_manager.service.js', () => ({
    default: { getFilePath: jest.fn().mockResolvedValue('/tmp/fake.pdf') }
}));

await jest.unstable_mockModule('../utils/printing_price.js', () => ({
    default: jest.fn().mockResolvedValue(3.5)
}));

const { default: printingPriceService } = await import('../services/printing_price.service.js');
const fileManagerMock = (await import('../services/file_manager.service.js')).default;
const printingUtilMock = (await import('../utils/printing_price.js')).default;

describe('Unit - PrintingPriceService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('calculateFromStoredFile calls fileManager and util and returns price', async () => {
        const price = await printingPriceService.calculateFromStoredFile('stored.pdf', 'general');
        expect(price).toBe(3.5);
        expect(fileManagerMock.getFilePath).toHaveBeenCalledWith('general', 'stored.pdf');
        expect(printingUtilMock).toHaveBeenCalledWith('/tmp/fake.pdf');
    });

    test('calculateFromStoredFile throws if filename missing', async () => {
        await expect(printingPriceService.calculateFromStoredFile('', 'general')).rejects.toThrow('filename requerido');
    });
});
