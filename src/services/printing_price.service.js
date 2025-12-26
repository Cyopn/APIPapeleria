import printingPrice, { analyzePdfPages } from '../utils/printing_price.js';
import fileManagerService from './file_manager.service.js';
import env, { PRICING } from '../config/env.js';

class PrintingPriceService {
    async calculateFromStoredFile(filename, service = 'general') {
        if (!filename) throw new Error('filename requerido');
        const filePath = await fileManagerService.getFilePath(service, filename);
        const price = await printingPrice(filePath);
        return price;
    }

    async calculateCombinationsFromStoredFile(filename, options = {}, service = 'general') {
        if (!filename) throw new Error('filename requerido');
        const filePath = await fileManagerService.getFilePath(service, filename);
        const pageCosts = await analyzePdfPages(filePath);
        if (!Array.isArray(pageCosts) || pageCosts.length === 0) return [];

        const colorModes = Array.isArray(options.colorModes) ? options.colorModes : (options.colorModes ? [options.colorModes] : ['bw', 'color']);
        const paperSizes = Array.isArray(options.paperSizes) ? options.paperSizes : (options.paperSizes ? [options.paperSizes] : ['carta', 'oficio']);
        const ranges = Array.isArray(options.ranges) ? options.ranges : (options.ranges ? [options.ranges] : ['all']);
        const bothSidesArr = Array.isArray(options.bothSides) ? options.bothSides : (typeof options.bothSides !== 'undefined' ? [options.bothSides] : [false, true]);

        const PAPER_PRICE = { carta: Number(PRICING.PAPER_PRICE_CARTA), oficio: Number(PRICING.PAPER_PRICE_OFICIO) };

        const BW_PRICE_PER_PAGE = Number(PRICING.BW_PRICE_PER_PAGE);
        const PREC = Number(PRICING.PRICE_PRECISION) || 4;

        const results = [];

        const totalPages = pageCosts.length;

        const pagesFromRange = (r) => {
            if (!r || r === 'all') return { start: 1, end: totalPages };
            const m = String(r).split('-').map(s => parseInt(s, 10));
            if (m.length === 2 && !isNaN(m[0]) && !isNaN(m[1])) return { start: Math.max(1, m[0]), end: Math.min(totalPages, m[1]) };
            const p = parseInt(r, 10);
            if (!isNaN(p)) return { start: p, end: p };
            return { start: 1, end: totalPages };
        };

        const sets = Number(options.sets || options.quantity || options.copies || 1) || 1;

        for (const colorMode of colorModes) {
            for (const paperSize of paperSizes) {
                for (const bothSides of bothSidesArr) {
                    for (const range of ranges) {
                        const { start, end } = pagesFromRange(range);
                        const pagesIndex = [];
                        for (let p = start; p <= end; p++) pagesIndex.push(p - 1);

                        const numPages = pagesIndex.length;

                        let inkCost = 0;
                        if (colorMode === 'color') {
                            const inkPerPage = pagesIndex.map(i => pageCosts[i] || 1);
                            inkCost = inkPerPage.reduce((a, b) => a + b, 0);
                        } else {
                            inkCost = numPages * BW_PRICE_PER_PAGE;
                        }
                        const sheets = bothSides ? Math.ceil(numPages / 2) : numPages;
                        const paperCost = (PAPER_PRICE[paperSize] || PAPER_PRICE.carta) * sheets;

                        const totalPerSet = Number((inkCost + paperCost).toFixed(PREC));
                        const totalPrice = Number((totalPerSet * sets).toFixed(PREC));

                        results.push({
                            colorMode,
                            paperSize,
                            bothSides,
                            range: String(range),
                            pages: numPages,
                            sheets,
                            sets,
                            pricePerSet: totalPerSet,
                            totalPrice,
                            breakdownPerSet: { inkCost: Number(inkCost.toFixed(PREC)), paperCost: Number(paperCost.toFixed(PREC)) },
                            breakdownTotal: { inkCost: Number((inkCost * sets).toFixed(PREC)), paperCost: Number((paperCost * sets).toFixed(PREC)) }
                        });
                    }
                }
            }
        }

        return results;
    }

    async calculateSingleFromStoredFile(filename, options = {}, service = 'general') {
        if (!filename) throw new Error('filename requerido');
        const filePath = await fileManagerService.getFilePath(service, filename);
        const pageCosts = await analyzePdfPages(filePath);
        if (!Array.isArray(pageCosts) || pageCosts.length === 0) return { price: 0, breakdown: {} };

        const colorMode = Array.isArray(options.colorModes) ? options.colorModes[0] : (options.colorModes || 'bw');
        const paperSize = Array.isArray(options.paperSizes) ? options.paperSizes[0] : (options.paperSizes || 'carta');
        const range = Array.isArray(options.ranges) ? options.ranges[0] : (options.ranges || 'all');
        const bothSides = Array.isArray(options.bothSides) ? options.bothSides[0] : (typeof options.bothSides !== 'undefined' ? options.bothSides : false);

        const PAPER_PRICE = { carta: Number(PRICING.PAPER_PRICE_CARTA), oficio: Number(PRICING.PAPER_PRICE_OFICIO) };
        const BW_FACTOR = Number(PRICING.BW_FACTOR);
        const BW_MIN = Number(PRICING.BW_MIN);
        const BW_PRICE_PER_PAGE = Number(PRICING.BW_PRICE_PER_PAGE);
        const PREC = Number(PRICING.PRICE_PRECISION) || 4;
        const totalPages = pageCosts.length;
        const sets = Number(options.sets || options.quantity || options.copies || 1) || 1;
        const pagesFromRange = (r) => {
            if (!r || r === 'all') return { start: 1, end: totalPages };
            const m = String(r).split('-').map(s => parseInt(s, 10));
            if (m.length === 2 && !isNaN(m[0]) && !isNaN(m[1])) return { start: Math.max(1, m[0]), end: Math.min(totalPages, m[1]) };
            const p = parseInt(r, 10);
            if (!isNaN(p)) return { start: p, end: p };
            return { start: 1, end: totalPages };
        };

        const { start, end } = pagesFromRange(range);
        const pagesIndex = [];
        for (let p = start; p <= end; p++) pagesIndex.push(p - 1);

        const numPages = pagesIndex.length;
        let inkCost = 0;
        if (colorMode === 'color') {
            const inkPerPage = pagesIndex.map(i => pageCosts[i] || 1);
            inkCost = inkPerPage.reduce((a, b) => a + b, 0);
        } else {
            inkCost = numPages * BW_PRICE_PER_PAGE;
        }
        const sheets = bothSides ? Math.ceil(numPages / 2) : numPages;
        const paperCost = (PAPER_PRICE[paperSize] || PAPER_PRICE.carta) * sheets;
        const totalPerSet = Number((inkCost + paperCost).toFixed(PREC));
        const totalPrice = Number((totalPerSet * sets).toFixed(PREC));

        return {
            pricePerSet: totalPerSet,
            totalPrice,
            breakdownPerSet: { inkCost: Number(inkCost.toFixed(PREC)), paperCost: Number(paperCost.toFixed(PREC)) },
            breakdownTotal: { inkCost: Number((inkCost * sets).toFixed(PREC)), paperCost: Number((paperCost * sets).toFixed(PREC)) },
            pages: numPages,
            sheets,
            sets
        };
    }
}

export default new PrintingPriceService();
