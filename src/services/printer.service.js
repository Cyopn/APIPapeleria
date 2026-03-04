import Printer from "../models/printer.model.js";
import Print from "../models/print.model.js";
import sequelize from "../config/db.js";

class PrinterService {
    async create(payload) {
        const printer = await Printer.create(payload);
        return printer;
    }

    async findAll() {
        return await Printer.findAll({ include: [{ model: Print, as: "prints" }] });
    }

    async findOne(id) {
        const printer = await Printer.findByPk(id, { include: [{ model: Print, as: "prints" }] });
        if (!printer) throw new Error("Impresora no encontrada");
        return printer;
    }

    async update(id, payload) {
        const t = await sequelize.transaction();
        try {
            const printer = await Printer.findByPk(id, { transaction: t });
            if (!printer) throw new Error("Impresora no encontrada");
            await Printer.update(payload, { where: { id_printer: id }, transaction: t });
            await t.commit();
            return this.findOne(id);
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async remove(id) {
        const t = await sequelize.transaction();
        try {
            await Printer.destroy({ where: { id_printer: id }, transaction: t });
            await t.commit();
            return { message: "Impresora eliminada" };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}

export default new PrinterService();
