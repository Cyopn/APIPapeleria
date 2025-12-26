import printingPriceService from '../services/printing_price.service.js';

export const calculatePrintingPrice = async (req, res, next) => {
    try {
        const { filename, colorModes, paperSizes, ranges, bothSides, sets, quantity, copies } = req.body;
        const service = req.body.service || req.query.service || 'general';
        if (!filename) return res.status(400).json({ message: 'Nombre de archivo requerido' });

        const hasAttributes = colorModes || paperSizes || ranges || typeof bothSides !== 'undefined';
        if (hasAttributes) {
            const options = { colorModes, paperSizes, ranges, bothSides, sets, quantity, copies };
            const anyArray = Array.isArray(colorModes) || Array.isArray(paperSizes) || Array.isArray(ranges) || Array.isArray(bothSides);
            if (anyArray) {
                const combos = await printingPriceService.calculateCombinationsFromStoredFile(filename, options, service);
                return res.json({ combinations: combos });
            }
            const single = await printingPriceService.calculateSingleFromStoredFile(filename, options, service);
            return res.json({ pricePerSet: single.pricePerSet, totalPrice: single.totalPrice, breakdownPerSet: single.breakdownPerSet, breakdownTotal: single.breakdownTotal, pages: single.pages, sheets: single.sheets, sets: single.sets });
        }

        const price = await printingPriceService.calculateFromStoredFile(filename, service);
        res.json({ price });
    } catch (err) {
        next(err);
    }
};
