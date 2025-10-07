import Item from "../models/item.model.js";

class ItemService {
    async save({ name, description, mount, price }) {
        const exists = await Item.findOne({ where: { name } });
        if (exists) throw new Error("Articulo ya existe");
        const item = await Item.create({ name: name, description: description, mount: mount, price: price });
        return{ name: item.name, description: item.description, mount: item.mount, price: item.price };
    }

    async update({ id, name, description, mount, price }) {
        const item = await Item.findByPk(id);
        if (item === null) throw new Error("Articulo no encontrado");
        const itemUpdate = await Item.update({ name: name, description: description, mount: mount, price: price }, {
            where: {
                id: id
            }
        });
        return { id: itemUpdate.id, name: itemUpdate.name, description: itemUpdate.description, mount: itemUpdate.mount, price: itemUpdate.price };
    }

    async listItems() {
        return await Item.findAll({ attributes: ["id", "name", "description", "mount", "price", "createdAt"] });
    }
}

export default new ItemService();
