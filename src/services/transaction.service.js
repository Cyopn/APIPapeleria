import Transaction from '../models/transaction.model.js';
import DetailTransaction from '../models/detail_transaction.model.js';
import Product from '../models/product.model.js';
import sequelize from '../config/db.js';

class TransactionService {
    async create({ type, date, id_user, details }) {
        const t = await sequelize.transaction();

        try {
            // Crear la transacción
            const transaction = await Transaction.create({
                type,
                date,
                id_user,
                total: details.reduce((sum, detail) => sum + (detail.price * detail.amount), 0)
            }, { transaction: t });

            // Crear los detalles de la transacción
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

    async update(id, { type, date, id_user, details }) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.findByPk(id);
            if (!transaction) {
                throw new Error('Transacción no encontrada');
            }

            // Actualizar la transacción principal
            await transaction.update({
                type,
                date,
                id_user,
                total: details.reduce((sum, detail) => sum + (detail.price * detail.amount), 0)
            }, { transaction: t });

            // Eliminar detalles antiguos
            await DetailTransaction.destroy({
                where: { id_transaction: id },
                transaction: t
            });

            // Crear nuevos detalles
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

            // Eliminar detalles primero
            await DetailTransaction.destroy({
                where: { id_transaction: id },
                transaction: t
            });

            // Eliminar la transacción
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