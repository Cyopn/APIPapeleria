import File from "../models/file.model.js";
import User from "../models/user.model.js";

class FileService {
    async upload({ id_user, filename, type, filehash }) {
        const user = await User.findByPk(id_user);
        if (!user) throw new Error("Usuario no encontrado");
        const file = await File.create({ id_user: user.id_user, filename: filename, status: "active", type: type, filehash: filehash });
        return file;
    }

    async uploadMany(files = []) {
        if (!Array.isArray(files)) throw new Error('Se esperaba un arreglo de archivos');
        const created = [];
        const t = await File.sequelize.transaction();
        try {
            for (const f of files) {
                const { id_user, filename, type, filehash } = f;
                const user = await User.findByPk(id_user, { transaction: t });
                if (!user) throw new Error("Usuario no encontrado para uno de los archivos");
                const file = await File.create({ id_user: user.id_user, filename: filename, status: "active", type: type, filehash: filehash }, { transaction: t });
                created.push(file);
            }
            await t.commit();
            return created;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async findAll() {
        return await File.findAll({ attributes: ["id_file", "id_user", "filename", "status", "type", "filehash", "createdAt"] })
    }

    async findOne(id) {
        const file = await File.findByPk(id);
        if (!file) throw new Error("Archivo no encontrado");
        return file;
    }

    async update(id, { filename, status }) {
        const file = await File.findByPk(id);
        if (!file) throw new Error("Archivo no encontrado");
        await File.update({ filename, status }, { where: { id_file: id } });
        return this.findOne(id);
    }

    async remove(id) {
        await File.destroy({ where: { id_file: id } });
        return { message: 'Archivo eliminado' };
    }
}

export default new FileService();