import Product from "../models/product.model.js";
import Print from "../models/print.model.js";
import Item from "../models/item.model.js";
import SpecialService from "../models/sp_service.model.js"

class ProductService {
    async create({ type, description, price, filename, filehash, name, mount, type_print, type_paper }) {
        if (type === "item") {
            const existsItem = await Item.findOne({ where: { name } });
            if (existsItem) throw new Error("Ya existe un producto con el mismo nombre");
            const product = await Product.create({ type: type, description: description, price: price, filename: filename, filehash: filehash });
            const item = await Item.create({ id_item: product.id_product, name: name, mount: mount });
            return { id_item: product.id_product, name: item.name, mount: item.mount, type: product.type, description: product.description, price: product.price }
        } else if (type === "print") {
            const existsPrint = await Print.findOne({ where: { type_print } });
            if (existsPrint) throw new Error("Ya existe una impresion con el mismo tipo");
            const product = await Product.create({ type: type, description: description, price: price, filename: filename, filehash: filehash });
            const print = await Print.create({ id_print: product.id_product, type_print: type_print, type_paper: type_paper });
            return { id_item: product.id_product, type_print: print.type_print, type_paper: print.type_paper, type: product.type, description: product.description, price: product.price }
        } else {
            const existsSpServ = await SpecialService.findOne({ where: { name } });
            if (existsSpServ) throw new Error("Ya existe un servicio especial del mismo nombre");
            const product = await Product.create({ type: type, description: description, price: price, filename: filename, filehash: filehash });
            const sp_services = await SpecialService.create({ id_special_service: product.id_product, name: name });
            return { id_item: product.id_product, name: sp_services.name, type: product.type, description: product.description, price: product.price }
        }
    }

    async findAll() {
        const prints = await Print.findAll({ attributes: ["id_print", "type_print", "type_paper", "createdAt"] });
        const items = await Item.findAll({ attributes: ["id_item", "name", "mount", "createdAt"] });
        const products = await Product.findAll({ attributes: ["id_product", "type", "description", "price", "filename", "filehash", "createdAt"] });
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
        await Item.destroy({ where: { id_product: id } });
        await Print.destroy({ where: { id_product: id } });
        await Product.destroy({ where: { id_product: id } });
        return { message: 'Producto eliminado' };
    }
}

export default new ProductService();