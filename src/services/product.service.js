import Product from "../models/product.model.js";
import Print from "../models/print.model.js";
import Item from "../models/item.model.js";

class ProductService {
    async create({ id, type, description, price, name, mount, type_print, type_paper }) {
        if (type === "item") {
            const existsItem = await Item.findOne({ where: { name } });
            if (existsItem) throw new Error("Ya existe un producto con el mismo nombre");
            const product = await Product.create({ id_product: id, type: type, description: description, price: price });
            const item = await Item.create({ id_item: product.id_product, name: name, mount: mount });
            return { id_item: product.id_product, name: item.name, mount: item.mount, type: product.type, description: product.description, price: product.price }
        } else {
            const existsPrint = await Print.findOne({ where: { type_print } });
            if (existsPrint) throw new Error("Ya existe una impresion con el mismo tipo");
            const product = await Product.create({ id_product: id, type: type, description: description, price: price });
            const print = await Print.create({ id_print: product.id_product, type_print: type_print, type_paper: type_paper });
            return { id_item: product.id_product, type_print: print.type_print, type_paper: print.type_paper, type: product.type, description: product.description, price: product.price }
        }
    }

    async findAll() {
        const prints = await Print.findAll({ attributes: ["id_print", "type_print", "type_paper", "createdAt"] });
        const items = await Item.findAll({ attributes: ["id_item", "name", "mount", "createdAt"] });
        const products = await Product.findAll({ attributes: ["id_product", "type", "description", "price", "createdAt"] });
        return { prints, items, products };
    }

    async findOne(id) {
        const product = await Product.findByPk(id);
        if (!product) throw new Error('Producto no encontrado');
        return product;
    }

    async update(id, { type, description, price, name, mount, type_print, type_paper }) {
        const product = await Product.findByPk(id);
        if (product === null) throw new Error("El producto no existe")
        await Product.update({ description: description, price: price }, { where: { id_product: id } })
        if (type === "item") {
            await Item.update({ name: name, mount: mount }, { where: { id_item: id } });
        } else {
            await Print.update({ type_print: type_print, type_paper: type_paper }, { where: { id_print: id } });
        }
        return this.findOne(id);
    }

    async remove(id) {
        await Item.destroy({ where: { id_item: id } });
        await Print.destroy({ where: { id_print: id } });
        await Product.destroy({ where: { id_product: id } });
        return { message: 'Producto eliminado' };
    }
}

export default new ProductService();