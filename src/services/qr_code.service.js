import QRCode from '../models/qr_code.model.js';
import Transaction from '../models/transaction.model.js';
import QRGenerator from '../utils/qr_generator.js';

class QRCodeService {

    async createQRForTransaction(transactionData) {
        try {
            const existingQR = await QRCode.findOne({
                where: { id_transaction: transactionData.id_transaction }
            });

            if (existingQR) {
                return await this.updateQRForTransaction(transactionData);
            }

            const qrPayload = {
                transaction_id: transactionData.id_transaction,
                user_id: transactionData.id_user,
                type: transactionData.type,
                total: parseFloat(transactionData.total),
                date: transactionData.date,
                status: transactionData.status,
                timestamp: new Date().getTime()
            };

            const qrImageBase64 = await QRGenerator.generateTransactionQR(qrPayload);
            const qrInfo = QRGenerator.generateQRInfo(transactionData);

            const qrCode = await QRCode.create({
                id_transaction: transactionData.id_transaction,
                qr_data: JSON.stringify(qrPayload),
                qr_image_base64: qrImageBase64,
                qr_info: qrInfo,
                generated_at: new Date(),
                is_active: true,
                scan_count: 0
            });

            return {
                id_qr: qrCode.id_qr,
                qr_code: qrImageBase64,
                qr_info: qrInfo,
                qr_data: qrPayload,
                generated_at: qrCode.generated_at,
                is_active: qrCode.is_active
            };

        } catch (error) {
            console.error('Error creando QR para transacción:', error);
            throw new Error('Error al crear código QR para la transacción');
        }
    }

    async updateQRForTransaction(transactionData) {
        try {
            const qrCode = await QRCode.findOne({
                where: { id_transaction: transactionData.id_transaction }
            });

            if (!qrCode) {
                throw new Error('Código QR no encontrado para esta transacción');
            }

            const qrPayload = {
                transaction_id: transactionData.id_transaction,
                user_id: transactionData.id_user,
                type: transactionData.type,
                total: parseFloat(transactionData.total),
                date: transactionData.date,
                status: transactionData.status,
                timestamp: new Date().getTime()
            };

            const qrImageBase64 = await QRGenerator.generateTransactionQR(qrPayload);
            const qrInfo = QRGenerator.generateQRInfo(transactionData);

            await qrCode.update({
                qr_data: JSON.stringify(qrPayload),
                qr_image_base64: qrImageBase64,
                qr_info: qrInfo,
                generated_at: new Date()
            });

            return {
                id_qr: qrCode.id_qr,
                qr_code: qrImageBase64,
                qr_info: qrInfo,
                qr_data: qrPayload,
                generated_at: qrCode.generated_at,
                is_active: qrCode.is_active
            };

        } catch (error) {
            console.error('Error actualizando QR:', error);
            throw error;
        }
    }
    async getQRByTransactionId(transactionId) {
        try {
            const qrCode = await QRCode.findOne({
                where: { id_transaction: transactionId },
                include: [{
                    model: Transaction,
                    as: 'transaction'
                }]
            });

            if (!qrCode) {
                throw new Error('Código QR no encontrado para esta transacción');
            }

            return {
                id_qr: qrCode.id_qr,
                qr_code: qrCode.qr_image_base64,
                qr_info: qrCode.qr_info,
                qr_data: JSON.parse(qrCode.qr_data),
                generated_at: qrCode.generated_at,
                is_active: qrCode.is_active,
                scan_count: qrCode.scan_count,
                last_scanned_at: qrCode.last_scanned_at
            };

        } catch (error) {
            console.error('Error obteniendo QR:', error);
            throw error;
        }
    }
    async recordQRScan(transactionId) {
        try {
            const qrCode = await QRCode.findOne({
                where: { id_transaction: transactionId }
            });

            if (!qrCode) {
                throw new Error('Código QR no encontrado');
            }

            await qrCode.update({
                scan_count: qrCode.scan_count + 1,
                last_scanned_at: new Date()
            });

            return {
                id_qr: qrCode.id_qr,
                scan_count: qrCode.scan_count + 1,
                last_scanned_at: new Date(),
                qr_info: qrCode.qr_info
            };

        } catch (error) {
            console.error('Error registrando escaneo:', error);
            throw error;
        }
    }
    async deactivateQR(transactionId) {
        try {
            const qrCode = await QRCode.findOne({
                where: { id_transaction: transactionId }
            });

            if (!qrCode) {
                throw new Error('Código QR no encontrado');
            }

            await qrCode.update({ is_active: false });
            return true;

        } catch (error) {
            console.error('Error desactivando QR:', error);
            throw error;
        }
    }
    async getQRStats() {
        try {
            const totalQRs = await QRCode.count();
            const activeQRs = await QRCode.count({ where: { is_active: true } });
            const totalScans = await QRCode.sum('scan_count');

            const mostScannedQR = await QRCode.findOne({
                order: [['scan_count', 'DESC']],
                include: [{
                    model: Transaction,
                    as: 'transaction'
                }]
            });

            return {
                total_qrs: totalQRs,
                active_qrs: activeQRs,
                inactive_qrs: totalQRs - activeQRs,
                total_scans: totalScans || 0,
                most_scanned: mostScannedQR ? {
                    transaction_id: mostScannedQR.id_transaction,
                    scan_count: mostScannedQR.scan_count,
                    qr_info: mostScannedQR.qr_info
                } : null
            };

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }
}

export default new QRCodeService();