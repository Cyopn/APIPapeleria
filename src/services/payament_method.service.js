import PayamentMethod from "../models/payament_method.model.js";

class PayamentMethodService {
    async create({ type }) {
        const exists = await PayamentMethod.findOne({ where: { type } });
        if (exists) throw new Error("Metodo de pago ya existe");
        const pm = await PayamentMethod.create({ type });
        return pm;
    }

    async findAll() {
        return await PayamentMethod.findAll({ attributes: ["id_payament_method", "type", "createdAt"] });
    }

    async findOne(id) {
        const pm = await PayamentMethod.findByPk(id);
        if (!pm) throw new Error("Metodo de pago no encontrado");
        return pm;
    }

    async update(id, { type }) {
        const pm = await PayamentMethod.findByPk(id);
        if (!pm) throw new Error("Metodo de pago no encontrado");
        await PayamentMethod.update({ type }, { where: { id_payament_method: id } });
        return this.findOne(id);
    }

    async remove(id) {
        await PayamentMethod.destroy({ where: { id_payament_method: id } });
        return { message: 'Metodo de pago eliminado' };
    }
}

export default new PayamentMethodService();