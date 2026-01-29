import printingPrice, { analyzePdfPages } from '../utils/printing_price.js';
import fileManagerService from './file_manager.service.js';
import { PRICING } from '../config/env.js'

class PrintingPriceService {
    async calculateFromStoredFile(filename, service) {
        if (!filename) throw new Error('filename requerido');
        if (Array.isArray(filename)) {
            const results = await Promise.all(filename.map(async (fn) => {
                const filePath = await fileManagerService.getFilePath(service, fn);
                const price = await printingPrice(filePath);
                return { filename: fn, price };
            }));
            return results;
        }
        const filePath = await fileManagerService.getFilePath(service, filename);
        const price = await printingPrice(filePath);
        return price;
    }

    async calculateSingleFromStoredFile(filename, options = {}, service) {
        if (!filename) throw new Error('filename requerido');
        const filePath = await fileManagerService.getFilePath(service, filename);
        const pageCosts = await analyzePdfPages(filePath);
        if (!Array.isArray(pageCosts) || pageCosts.length === 0) return { price: 0, breakdown: {} };

        const colorMode = options.colorModes;
        const paperSize = options.paperSizes;
        const paperType = options.paperType;
        const range = options.ranges;
        const bothSides = options.bothSides;
        const calcType = options.type;
        const coverType = options.coverType;
        const bindingType = options.bindingType;
        const ringType = options.ringType;
        const documentType = options.documentType;

        const missing = [];
        if (colorMode === undefined || colorMode === null || colorMode === '') missing.push('colorModes');
        if (calcType !== 'photo') {
            if (paperSize === undefined || paperSize === null || paperSize === '') missing.push('paperSizes');
            if (range === undefined || range === null || range === '') missing.push('ranges');
            if (bothSides === undefined || bothSides === null) missing.push('bothSides');
        }
        if (calcType === 'bound') {
            if (coverType === undefined || coverType === null || coverType === '') missing.push('coverType');
            if (bindingType === undefined || bindingType === null || bindingType === '') missing.push('bindingType');
        }
        if (calcType === 'spiral') {
            if (ringType === undefined || ringType === null || ringType === '') missing.push('ringType');
        }
        if (calcType === 'docs') {
            if (documentType === undefined || documentType === null || documentType === '') missing.push('documentType');
        }
        if (calcType === 'photo') {
            if (paperType === undefined || paperType === null || paperType === '') missing.push('paperType');
        }
        if (missing.length > 0) {
            const err = new Error('Faltan campos: ' + missing.join(', '));
            err.status = 400;
            throw err;
        }

        const PAPER_PRICE = { carta: Number(PRICING.PAPER_PRICE_CARTA), oficio: Number(PRICING.PAPER_PRICE_OFICIO) };
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
        let paperCost = (PAPER_PRICE[paperSize] || PAPER_PRICE.carta) * sheets;

        let bindingCostPerSet = 0;
        let bindingBreakdown = {};
        if (calcType === 'bound') {
            const COVER_PRICE_DURA = Number(PRICING.COVER_PRICE_DURA) || Number(PRICING.COVER_PRICE_HARD) || 10;
            const COVER_PRICE_BLANDA = Number(PRICING.COVER_PRICE_BLANDA) || Number(PRICING.COVER_PRICE_SOFT) || 5;
            const BINDING_PRICE_ESPIRAL = Number(PRICING.BINDING_PRICE_ESPIRAL) || Number(PRICING.BINDING_PRICE_SPIRAL) || 3;
            const BINDING_PRICE_ENCOLADA = Number(PRICING.BINDING_PRICE_ENCOLADA) || Number(PRICING.BINDING_PRICE_GLUE) || 4;

            const coverCost = (String(coverType).toLowerCase().includes('dura') || String(coverType).toLowerCase().includes('dura')) ? COVER_PRICE_DURA : COVER_PRICE_BLANDA;
            const bindMethodCost = String(bindingType).toLowerCase().includes('espiral') ? BINDING_PRICE_ESPIRAL : BINDING_PRICE_ENCOLADA;

            bindingCostPerSet = coverCost + bindMethodCost;
            bindingBreakdown = { coverType, bindingType, coverCost: Number(coverCost.toFixed ? coverCost.toFixed(PREC) : coverCost), bindingMethodCost: Number(bindMethodCost.toFixed ? bindMethodCost.toFixed(PREC) : bindMethodCost) };
        }
        if (calcType === 'spiral') {
            const BINDING_PRICE_PLASTIC = Number(PRICING.BINDING_PRICE_PLASTIC) || Number(PRICING.BINDING_PRICE_SPIRAL) || 2;
            const BINDING_PRICE_METAL = Number(PRICING.BINDING_PRICE_METAL) || Number(PRICING.BINDING_PRICE_SPIRAL) || 5;
            const ringCost = String(ringType).toLowerCase().includes('metal') ? BINDING_PRICE_METAL : BINDING_PRICE_PLASTIC;
            bindingCostPerSet = ringCost;
            bindingBreakdown = { ringType, ringCost: Number(ringCost.toFixed ? ringCost.toFixed(PREC) : ringCost) };
        }
        if (calcType === 'photo') {
            const PHOTO_PAPER_BRILLO = Number(PRICING.PHOTO_PAPER_BRILLO);
            const PHOTO_PAPER_MATE = Number(PRICING.PHOTO_PAPER_MATE);
            const PHOTO_PAPER_SATIN = Number(PRICING.PHOTO_PAPER_SATIN);
            const pt = String(paperType || '').toLowerCase();
            let perSheet = PHOTO_PAPER_BRILLO;
            if (pt.includes('mate')) perSheet = PHOTO_PAPER_MATE;
            else if (pt.includes('satin') || pt.includes('satinado')) perSheet = PHOTO_PAPER_SATIN;
            const photoPaperCost = perSheet * sheets;
            paperCost = photoPaperCost;
            bindingBreakdown.photo = { paperType, photoPaperCost: Number(photoPaperCost.toFixed ? photoPaperCost.toFixed(PREC) : photoPaperCost) };
        }
        if (calcType === 'docs') {
            const DOC_PRICE_TESIS = Number(PRICING.DOC_PRICE_TESIS);
            const DOC_PRICE_EXAMEN = Number(PRICING.DOC_PRICE_EXAMEN);
            const DOC_PRICE_REPORTE = Number(PRICING.DOC_PRICE_REPORTE);
            const DOC_PRICE_OTRO = Number(PRICING.DOC_PRICE_OTRO);
            const dt = String(documentType).toLowerCase();
            let chosen = DOC_PRICE_OTRO;
            if (dt.includes('tesis')) chosen = DOC_PRICE_TESIS;
            else if (dt.includes('examen')) chosen = DOC_PRICE_EXAMEN;
            else if (dt.includes('reporte')) chosen = DOC_PRICE_REPORTE;
            var docsCostPerSet = chosen;
        }

        let totalPerSet = Number((inkCost + paperCost + bindingCostPerSet + (typeof docsCostPerSet !== 'undefined' ? docsCostPerSet : 0)).toFixed(PREC));
        let totalPrice = Number((totalPerSet * sets).toFixed(PREC));
        if (calcType === 'photo') {
            totalPerSet = Number((inkCost + paperCost + bindingCostPerSet).toFixed(PREC));
            totalPrice = totalPerSet;
        }

        const coverCostPerSet = calcType === 'bound' ? Number(bindingBreakdown.coverCost || 0) : 0;
        const bindingMethodCostPerSet = calcType === 'bound' ? Number(bindingBreakdown.bindingMethodCost || 0) : 0;
        const spiralRingCostPerSet = calcType === 'spiral' ? Number(bindingBreakdown.ringCost || 0) : 0;
        const photoPaperCostPerSet = calcType === 'photo' ? Number((bindingBreakdown.photo && bindingBreakdown.photo.photoPaperCost) || 0) : 0;

        const breakdownPerSet = {
            inkCost: Number(inkCost.toFixed(PREC)),
            paperCost: Number(paperCost.toFixed(PREC))
        };
        const breakdownTotal = {
            inkCost: Number((inkCost * sets).toFixed(PREC)),
            paperCost: Number((paperCost * sets).toFixed(PREC))
        };

        if (calcType === 'bound') {
            breakdownPerSet.coverCost = Number(coverCostPerSet.toFixed ? coverCostPerSet.toFixed(PREC) : coverCostPerSet);
            breakdownPerSet.bindingCost = Number(bindingMethodCostPerSet.toFixed ? bindingMethodCostPerSet.toFixed(PREC) : bindingMethodCostPerSet);
            breakdownTotal.coverCost = Number((coverCostPerSet * sets).toFixed(PREC));
            breakdownTotal.bindingCost = Number((bindingMethodCostPerSet * sets).toFixed(PREC));
        }
        if (calcType === 'spiral') {
            breakdownPerSet.ringCost = Number(spiralRingCostPerSet.toFixed ? spiralRingCostPerSet.toFixed(PREC) : spiralRingCostPerSet);
            breakdownTotal.ringCost = Number((spiralRingCostPerSet * sets).toFixed(PREC));
        }
        if (calcType === 'docs') {
            const docsVal = (typeof docsCostPerSet !== 'undefined') ? docsCostPerSet : 0;
            breakdownPerSet.docsCost = Number(docsVal.toFixed ? docsVal.toFixed(PREC) : docsVal);
            breakdownTotal.docsCost = Number((docsVal * sets).toFixed(PREC));
        }
        if (calcType === 'photo') {
            const photoVal = photoPaperCostPerSet;
            breakdownPerSet.photoPaperType = paperType;
            breakdownPerSet.photoPaperCost = Number(photoVal.toFixed ? photoVal.toFixed(PREC) : photoVal);
            breakdownTotal.photoPaperCost = Number((photoVal * sets).toFixed(PREC));
        }

        const inkCostPerSet = Number(inkCost.toFixed ? inkCost.toFixed(PREC) : inkCost);
        const paperCostPerSetVal = Number(paperCost.toFixed ? paperCost.toFixed(PREC) : paperCost);
        const inkCostTotal = calcType === 'photo' ? inkCostPerSet : Number((inkCostPerSet * sets).toFixed(PREC));
        const paperCostTotal = calcType === 'photo' ? paperCostPerSetVal : Number((paperCostPerSetVal * sets).toFixed(PREC));

        const result = {
            pricePerSet: totalPerSet,
            totalPrice,
            pages: numPages,
            sheets,
            sets,
            inkCostPerSet,
            paperCostPerSet: paperCostPerSetVal,
            inkCostTotal,
            paperCostTotal
        };

        result.breakdownTotal = Object.assign({}, breakdownTotal, { inkCost: inkCostTotal, paperCost: paperCostTotal });

        if (calcType !== 'photo') {
            result.breakdownPerSet = breakdownPerSet;
        }

        return result;
    }
}

export default new PrintingPriceService();
