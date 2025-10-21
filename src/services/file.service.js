import File from "../models/file.model.js";
import User from "../models/user.model.js";

class FileService {
    async upload({ id_user, name_file }) {
        const user = await User.findByPk(id_user);
        if (!user) throw new Error("Usuario no encontrado");
        const file = await File.create({ id_user: user.id_user, name_file, status: "active" });
        return file;
    }

    async findAll() {
        return await File.findAll({ attributes: ["if_file", "id_iser", "name_file", "status", "createAt"] })
    }

    async findOne(id) {
        const file = await File.findByPk(id);
        if (!file) throw new Error("Archivo no encontrado");
        return file;
    }

    async update(id, { name_file, status }) {
        const file = await File.findByPk(id);
        if (!file) throw new Error("Archivo no encontrado");
        await File.update({ name_file, status }, { where: { id_file: id } });
        return this.findOne(id);
    }

    async remove(id) {
        await File.destroy({ where: { id_file: id } });
        return { message: 'Archivo eliminado' };
    }
}

export default new FileService();