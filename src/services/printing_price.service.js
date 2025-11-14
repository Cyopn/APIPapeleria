import printingPrice from '../utils/printing_price.js';
import fileManagerService from './file_manager.service.js';

class PrintingPriceService {
    async calculateFromStoredFile(filename, service = 'general') {
        if (!filename) throw new Error('filename requerido');
        const filePath = await fileManagerService.getFilePath(service, filename);
        const price = await printingPrice(filePath);
        return price;
    }
}

export default new PrintingPriceService();
