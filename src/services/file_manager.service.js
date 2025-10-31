import path from "path";
import fs from "fs/promises";

class FileManagerService {
    async listServiceFiles(service = "general") {
        const dir = path.resolve(`./src/public/${service}`);
        await fs.mkdir(dir, { recursive: true });
        const metaFile = path.join(dir, "files.json");
        let meta = [];
        try {
            const data = await fs.readFile(metaFile, "utf-8");
            meta = JSON.parse(data);
        } catch (err) {
            meta = [];
        }
        return meta;
    }

    async listUserFiles(usernameOrId) {
        const publicDir = path.resolve("./src/public");
        await fs.mkdir(publicDir, { recursive: true });
        const serviceFolders = await fs.readdir(publicDir, { withFileTypes: true });
        const userFiles = [];
        for (const folder of serviceFolders) {
            if (!folder.isDirectory()) continue;
            const serviceDir = path.join(publicDir, folder.name);
            const metaFile = path.join(serviceDir, "files.json");
            let meta = [];
            try {
                const data = await fs.readFile(metaFile, "utf-8");
                meta = JSON.parse(data);
            } catch (err) {
                meta = [];
            }
            const filtered = meta.filter(f => f.user === usernameOrId);
            filtered.forEach(f => f.service = folder.name);
            userFiles.push(...filtered);
        }
        return userFiles;
    }

    async addFileMetadata(usernameOrId, service, storedName, originalName, mimetype) {
        const dir = `./src/public/${service}`;
        await fs.mkdir(dir, { recursive: true });
        const metaFile = path.resolve(`${dir}/files.json`);
        let meta = [];
        try {
            const data = await fs.readFile(metaFile, "utf-8");
            meta = JSON.parse(data);
        } catch (err) {
            meta = [];
        }
        meta.push({
            user: usernameOrId,
            filename: storedName,
            originalName,
            mimetype,
            uploadedAt: new Date(),
            service
        });
        await fs.writeFile(metaFile, JSON.stringify(meta, null, 2));
    }
    
    async getFilePath(service, filename) {
        const filePath = path.resolve(`./src/public/${service}/${filename}`);
        return filePath;
    }
}

export default new FileManagerService();
