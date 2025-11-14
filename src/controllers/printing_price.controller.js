import printingPriceService from '../services/printing_price.service.js';

export const calculatePrintingPrice = async (req, res, next) => {
    try {
        const { filename } = req.body;
        const service = req.body.service || req.query.service || 'general';
        if (!filename) return res.status(400).json({ message: 'Nombre de archivo requerido' });
        const price = await printingPriceService.calculateFromStoredFile(filename, service);
        res.json({ price });
    } catch (err) {
        next(err);
    }
};
