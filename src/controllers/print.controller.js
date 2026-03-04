import printService from "../services/print.service.js";

export const assignPrinterToPrint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { printer_id } = req.body;

        const parsedPrinterId = (typeof printer_id === 'undefined') ? null : (printer_id === null ? null : Number(printer_id));

        const updated = await printService.assignPrinter(id, parsedPrinterId);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};
