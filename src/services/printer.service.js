import Printer from "../models/printer.model.js";
import Print from "../models/print.model.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";

const normalizeString = (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
};

const normalizePort = (value) => {
    if (typeof value === "undefined" || value === null || value === "") return null;
    const port = Number(value);
    return Number.isNaN(port) ? null : port;
};

const buildDuplicateWhere = (payload = {}, excludeId = null) => {
    const clauses = [];

    const name = normalizeString(payload.name);
    const serialNumber = normalizeString(payload.serial_number);
    const macAddress = normalizeString(payload.mac_address);
    const connectionType = normalizeString(payload.connection_type);
    const ip = normalizeString(payload.ip);
    const port = normalizePort(payload.port);
    const portName = normalizeString(payload.port_name);

    if (name) clauses.push({ name });
    if (serialNumber) clauses.push({ serial_number: serialNumber });
    if (macAddress) clauses.push({ mac_address: macAddress });

    if (connectionType === "network" && ip && port !== null) {
        clauses.push({ connection_type: "network", ip, port });
    }

    if (connectionType === "usb" && portName) {
        clauses.push({ connection_type: "usb", port_name: portName });
    }

    if (!clauses.length) return null;

    const where = { [Op.or]: clauses };
    if (excludeId !== null) {
        where.id_printer = { [Op.ne]: excludeId };
    }

    return where;
};

const assertNoDuplicatePrinter = async (payload = {}, excludeId = null, transaction = undefined) => {
    const where = buildDuplicateWhere(payload, excludeId);
    if (!where) return;

    const existingPrinter = await Printer.findOne({ where, transaction });
    if (existingPrinter) {
        throw new Error("Ya existe una impresora registrada con esos datos");
    }
};

class PrinterService {
    async create(payload) {
        await assertNoDuplicatePrinter(payload);
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

            const mergedPayload = {
                name: typeof payload.name !== "undefined" ? payload.name : printer.name,
                serial_number: typeof payload.serial_number !== "undefined" ? payload.serial_number : printer.serial_number,
                mac_address: typeof payload.mac_address !== "undefined" ? payload.mac_address : printer.mac_address,
                connection_type: typeof payload.connection_type !== "undefined" ? payload.connection_type : printer.connection_type,
                ip: typeof payload.ip !== "undefined" ? payload.ip : printer.ip,
                port: typeof payload.port !== "undefined" ? payload.port : printer.port,
                port_name: typeof payload.port_name !== "undefined" ? payload.port_name : printer.port_name,
            };

            await assertNoDuplicatePrinter(mergedPayload, id, t);

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
