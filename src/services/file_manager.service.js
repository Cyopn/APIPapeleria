import path from "path";
import fs from "fs/promises";

class fileManagerService {
    async listFiles() {
        const dir = "./src/public";
        await fs.mkdir(dir, { recursive: true });
        const files = await fs.readdir(dir);
        return files;
    }

    async getFilePath(filename) {
        const filePath = path.resolve(`./src/public/${filename}`);
        return filePath;
    }
}

export default new fileManagerService();