import Transaction from '../models/transaction.model.js';
import DetailTransaction from '../models/detail_transaction.model.js';
import Product from '../models/product.model.js';
import sequelize from '../config/db.js';

class TransactionService {
    async create({ type, date, id_user, details, status, payament_method }) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.create({
                type,
                date,
                id_user,
                total: details.reduce((sum, detail) => sum + (detail.price * detail.amount), 0),
                status: typeof status !== 'undefined' ? status : undefined,
                payament_method: typeof payament_method !== 'undefined' ? payament_method : undefined
            }, { transaction: t });

            const detailPromises = details.map(detail =>
                DetailTransaction.create({
                    id_transaction: transaction.id_transaction,
                    id_product: detail.id_product,
                    amount: detail.amount,
                    price: detail.price
                }, { transaction: t })
            );

            await Promise.all(detailPromises);
            await t.commit();

            return transaction;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async findAll() {
        return Transaction.findAll({
            include: [{
                model: DetailTransaction,
                as: 'details',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }]
        });
    }

    async findOne(id) {
        const transaction = await Transaction.findByPk(id, {
            include: [{
                model: DetailTransaction,
                as: 'details',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }]
        });

        if (!transaction) {
            throw new Error('Transacción no encontrada');
        }

        return transaction;
    }

    async update(id, { type, date, id_user, details, status, payament_method }) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.findByPk(id);
            if (!transaction) {
                throw new Error('Transacción no encontrada');
            }

            await transaction.update({
                type,
                date,
                id_user,
                total: details.reduce((sum, detail) => sum + (detail.price * detail.amount), 0),
                status: typeof status !== 'undefined' ? status : transaction.status,
                payament_method: typeof payament_method !== 'undefined' ? payament_method : transaction.payament_method
            }, { transaction: t });

            await DetailTransaction.destroy({
                where: { id_transaction: id },
                transaction: t
            });

            const detailPromises = details.map(detail =>
                DetailTransaction.create({
                    id_transaction: id,
                    id_product: detail.id_product,
                    amount: detail.amount,
                    price: detail.price
                }, { transaction: t })
            );

            await Promise.all(detailPromises);
            await t.commit();

            return transaction;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async remove(id) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.findByPk(id);
            if (!transaction) {
                throw new Error('Transacción no encontrada');
            }

            await DetailTransaction.destroy({
                where: { id_transaction: id },
                transaction: t
            });

            await transaction.destroy({ transaction: t });
            await t.commit();

            return true;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default new TransactionService();