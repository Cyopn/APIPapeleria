import QRCode from 'qrcode';

class QRGenerator {
    async generateTransactionQR(transactionData) {
        try {
            const qrPayload = {
                transaction_id: transactionData.id_transaction,
                user_id: transactionData.id_user,
                type: transactionData.type,
                total: transactionData.total,
                date: transactionData.date,
                status: transactionData.status,
                timestamp: new Date().getTime()
            };

            const qrData = JSON.stringify(qrPayload);

            const options = {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                quality: 0.92,
                margin: 1,
                width: 256,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };

            const qrBase64 = await QRCode.toDataURL(qrData, options);

            return qrBase64;
        } catch (error) {
            console.error('Error generando código QR:', error);
            throw new Error('Error al generar código QR para la transacción');
        }
    }
    async generateCustomQR(text, options = {}) {
        try {
            const defaultOptions = {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                quality: 0.92,
                margin: 1,
                width: 256,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };

            const finalOptions = { ...defaultOptions, ...options };
            const qrBase64 = await QRCode.toDataURL(text, finalOptions);

            return qrBase64;
        } catch (error) {
            console.error('Error generando código QR personalizado:', error);
            throw new Error('Error al generar código QR personalizado');
        }
    }
    generateQRInfo(transactionData) {
        return `Transacción #${transactionData.id_transaction} - ${transactionData.type.toUpperCase()} - $${transactionData.total} - ${transactionData.status.toUpperCase()}`;
    }
}

export default new QRGenerator();