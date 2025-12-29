import printingPriceService from '../services/printing_price.service.js';

export const calculatePrintingPrice = async (req, res, next) => {
    try {
        const { filename, colorModes, paperSizes, ranges, bothSides, sets, type, coverType, bindingType, documentType } = req.body;
        const { paperType } = req.body;
        const service = req.body.service;
        if (!filename) return res.status(400).json({ message: 'Nombre de archivo requerido' });
        const { ringType, anillado } = req.body;
        const hasAttributes = type === 'bound' || type === 'spiral' || type === 'docs' || type === 'photo' || colorModes || paperSizes || ranges || typeof bothSides !== 'undefined' || coverType || bindingType || ringType || anillado || documentType || paperType;
        if (hasAttributes) {
            const options = { colorModes, paperSizes, ranges, bothSides, sets, type, coverType, bindingType, ringType, anillado, documentType, paperType };
            const single = await printingPriceService.calculateSingleFromStoredFile(filename, options, service);
            return res.json({ pricePerSet: single.pricePerSet, totalPrice: single.totalPrice, breakdownPerSet: single.breakdownPerSet, breakdownTotal: single.breakdownTotal, pages: single.pages, sheets: single.sheets, sets: single.sets });
        }

        const price = await printingPriceService.calculateFromStoredFile(filename, service);
        res.json({ price });
    } catch (err) {
        next(err);
    }
};
