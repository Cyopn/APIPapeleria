import Print from "../models/print.model.js";
import Printer from "../models/printer.model.js";
import sequelize from "../config/db.js";

class PrintService {
    async assignPrinter(id, printerId) {
        const t = await sequelize.transaction();
        try {
            const print = await Print.findByPk(id, { transaction: t });
            if (!print) throw new Error("Print no encontrado");

            if (printerId !== null && typeof printerId !== 'undefined') {
                const printer = await Printer.findByPk(printerId, { transaction: t });
                if (!printer) throw new Error("Printer no encontrada");
            }

            await Print.update({ printer_id: printerId }, { where: { id_print: id }, transaction: t });
            await t.commit();

            return await Print.findByPk(id, { include: [{ model: Printer, as: "printer" }] });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}

export default new PrintService();
