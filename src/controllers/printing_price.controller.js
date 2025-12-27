import printingPriceService from '../services/printing_price.service.js';

export const calculatePrintingPrice = async (req, res, next) => {
    try {
        const { filename, colorModes, paperSizes, ranges, bothSides, sets, type, coverType, bindingType } = req.body;
        const service = req.body.service;
        if (!filename) return res.status(400).json({ message: 'Nombre de archivo requerido' });
        const hasAttributes = type === 'bound' || colorModes || paperSizes || ranges || typeof bothSides !== 'undefined' || coverType || bindingType;
        if (hasAttributes) {
            const options = { colorModes, paperSizes, ranges, bothSides, sets, type, coverType, bindingType };
            const single = await printingPriceService.calculateSingleFromStoredFile(filename, options, service);
            return res.json({ pricePerSet: single.pricePerSet, totalPrice: single.totalPrice, breakdownPerSet: single.breakdownPerSet, breakdownTotal: single.breakdownTotal, pages: single.pages, sheets: single.sheets, sets: single.sets });
        }

        const price = await printingPriceService.calculateFromStoredFile(filename, service);
        res.json({ price });
    } catch (err) {
        next(err);
    }
};
