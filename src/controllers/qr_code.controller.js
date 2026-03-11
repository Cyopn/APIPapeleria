import QRCodeService from '../services/qr_code.service.js';

export const rebuildAllQRCodes = async (req, res, next) => {
    try {
        const result = await QRCodeService.rebuildAllQRCodes();
        res.json({
            success: true,
            message: 'Reconstrucción de QRs finalizada',
            ...result
        });
    } catch (err) {
        next(err);
    }
};

export const getQRStats = async (req, res, next) => {
    try {
        const stats = await QRCodeService.getQRStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
};

export const deactivateQR = async (req, res, next) => {
    try {
        const { transactionId } = req.params;
        await QRCodeService.deactivateQR(transactionId);
        res.json({
            success: true,
            message: 'Código QR desactivado exitosamente'
        });
    } catch (err) {
        next(err);
    }
};

export const getQRDetails = async (req, res, next) => {
    try {
        const { transactionId } = req.params;
        const qrDetails = await QRCodeService.getQRByTransactionId(transactionId);
        res.json(qrDetails);
    } catch (err) {
        next(err);
    }
};