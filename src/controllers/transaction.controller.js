import transactionService from "../services/transaction.service.js";
import QRCodeService from "../services/qr_code.service.js";

export const createTransaction = async (req, res, next) => {
    try {
        console.log('Creando transacción con datos:', req.body);
        const transaction = await transactionService.create(req.body);
        res.status(201).json(transaction);
    } catch (err) {
        next(err);
    }
};

export const listTransactions = async (req, res, next) => {
    try {
        const transactions = await transactionService.findAll();
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

export const listTransactionsByUser = async (req, res, next) => {
    try {
        const { id_user } = req.params;
        const transactions = await transactionService.findAllByUserId(id_user);
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

export const listTransactionsDetails = async (req, res, next) => {
    try {
        const transactions = await transactionService.findAllDetails();
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

export const listTransactionsDetailsByUser = async (req, res, next) => {
    try {
        const { id_user } = req.params;
        const transactions = await transactionService.findAllDetailsByUserId(id_user);
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

export const getTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await transactionService.findOne(id);
        res.json(transaction);
    } catch (err) {
        next(err);
    }
};

export const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await transactionService.update(id, req.body);
        res.json(transaction);
    } catch (err) {
        next(err);
    }
};

export const completeTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await transactionService.complete(id);
        res.json(transaction);
    } catch (err) {
        next(err);
    }
};

export const updateTransactionFilesStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const status = req.body?.status;
        const result = await transactionService.updateFilesStatus(id, status);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await transactionService.remove(id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const generateTransactionQR = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await transactionService.findOne(id);
        const qrData = {
            qr_code: transaction.qr_code,
            qr_info: transaction.qr_info,
            transaction_id: transaction.id_transaction
        };

        res.json(qrData);
    } catch (err) {
        next(err);
    }
};

export const scanQR = async (req, res, next) => {
    try {
        const { qrData, base64Data } = req.body;
        let qrContent;
        let parsedQRData;

        if (base64Data) {
            try {
                const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
                return res.status(400).json({
                    error: 'Para escanear desde base64 de imagen se requiere una librería de lectura de QR. Por favor envía el contenido del QR como texto plano en el campo qrData.'
                });
            } catch (error) {
                return res.status(400).json({
                    error: 'Base64 inválido',
                    details: error.message
                });
            }
        }

        if (qrData) {
            qrContent = qrData;
        }

        if (!qrContent && req.body && typeof req.body === 'object') {
            const hasDirectPayload = (
                typeof req.body.transaction_id !== 'undefined' ||
                typeof req.body.id_transaction !== 'undefined'
            );

            if (hasDirectPayload) {
                parsedQRData = req.body;
            }
        }

        if (!qrContent && !parsedQRData) {
            return res.status(400).json({
                error: 'Se requiere qrData (contenido del QR como texto) o base64Data'
            });
        }

        if (!parsedQRData) {
            try {
                parsedQRData = typeof qrContent === 'string' ? JSON.parse(qrContent) : qrContent;
            } catch (error) {
                return res.status(400).json({
                    error: 'El contenido del QR no es un JSON válido',
                    details: error.message
                });
            }
        }

        const normalizedQRData = {
            transaction_id: parsedQRData.transaction_id ?? parsedQRData.id_transaction,
            user_id: parsedQRData.user_id ?? parsedQRData.id_user,
            type: parsedQRData.type,
            total: parsedQRData.total,
            date: parsedQRData.date,
            status: parsedQRData.status,
            timestamp: parsedQRData.timestamp
        };

        if (!normalizedQRData.transaction_id) {
            return res.status(400).json({
                error: 'El QR no contiene un transaction_id válido',
                received: parsedQRData
            });
        }

        const transaction = await transactionService.findOne(normalizedQRData.transaction_id);

        const isValid = (
            Number(transaction.id_transaction) === Number(normalizedQRData.transaction_id) &&
            Number(transaction.id_user) === Number(normalizedQRData.user_id) &&
            transaction.type === normalizedQRData.type &&
            parseFloat(transaction.total) === Number(normalizedQRData.total) &&
            transaction.status === normalizedQRData.status
        );

        if (!isValid) {
            return res.status(400).json({
                error: 'Los datos del QR no coinciden con la transacción actual',
                qr_data: normalizedQRData,
                current_transaction: {
                    id_transaction: transaction.id_transaction,
                    id_user: transaction.id_user,
                    type: transaction.type,
                    total: parseFloat(transaction.total),
                    status: transaction.status
                }
            });
        }

        await QRCodeService.recordQRScan(normalizedQRData.transaction_id);
        res.json({
            success: true,
            message: 'QR escaneado exitosamente',
            scanned_at: new Date().toISOString(),
            qr_data: normalizedQRData,
            transaction: transaction
        });

    } catch (err) {
        if (err.message === 'Transacción no encontrada') {
            return res.status(404).json({
                error: 'No se encontró ninguna transacción con el ID del QR escaneado',
                transaction_id: req.body.qrData?.transaction_id || 'No especificado'
            });
        }
        next(err);
    }
};
