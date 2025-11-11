import fs from 'fs'
import { PDFDocument } from 'pdf-lib';
import { fromPath } from 'pdf2pic';
import sharp from 'sharp';

const pricePrint = async (filename) => {
    try {
        const pdfBytes = fs.readFileSync(filename);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const options = {
            density: 100,
            saveFilename: 'pagina',
            savePath: "./src/public/price",
            format: 'png',
            width: 1024,
            height: 1024
        };
        const pdf = fromPath(filename, options);
        const pages = pdfDoc.getPages();
        let costoTotal = 0;
        const costoBaseColor = 1;
        const costoColorExtra = 0.5;
        pages.forEach(async (page, pageIndex) => {
            await pdf(pageIndex + 1, { responseType: 'image' }).then(async r => {
                const image = sharp(r.path);
                const buffer = await image.raw().toBuffer();
                let totalPixels = buffer.length / 3;
                let colorCount = 0;
                for (let i = 0; i < buffer.length; i += 3) {
                    const r = buffer[i];
                    const g = buffer[i + 1];
                    const b = buffer[i + 2];
                    if (r < 255 || g < 255 || b < 255) {
                        colorCount++;
                    }
                }
                const colorPercentage = (colorCount / totalPixels) * 100;
                if (colorPercentage === 0) {
                    costoTotal += 0.5;
                } else {
                    const costoColor = costoBaseColor + (Math.ceil(colorPercentage / 50) * costoColorExtra);
                    costoTotal += costoColor;
                }
            });
        });
         return costoTotal
    } catch (e) {
        console.log(e)
    }
}

export default pricePrint;
