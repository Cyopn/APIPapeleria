import fs from 'fs';
import sharp from 'sharp';

const analyzePdfPages = async (filename) => {
    const TARGET_WIDTH = 1024;
    const analyzePngBuffer = async (pngBuffer) => {
        const { data: raw, info } = await sharp(pngBuffer).raw().toBuffer({ resolveWithObject: true });
        const channels = info.channels || 3;
        const totalPixels = raw.length / channels || 0;
        let colorCount = 0;
        for (let i = 0; i < raw.length; i += channels) {
            let isWhite = true;
            for (let c = 0; c < channels; c++) {
                if (raw[i + c] < 255) {
                    isWhite = false;
                    break;
                }
            }
            if (!isWhite) colorCount++;
        }
        const colorPercentage = totalPixels === 0 ? 0 : (colorCount / totalPixels) * 100;
        if (colorPercentage === 0) return 1;
        const costoBaseColor = 1;
        const costoColorExtra = 0.5;
        return costoBaseColor + (Math.ceil(colorPercentage / 50) * costoColorExtra);
    };
    try {
        try {
            if (typeof globalThis.DOMMatrix === 'undefined') {
                globalThis.DOMMatrix = class DOMMatrix { constructor() { } multiply() { return this; } };
            }
            if (typeof globalThis.ImageData === 'undefined') {
                globalThis.ImageData = class ImageData { constructor(data, width, height) { this.data = data; this.width = width; this.height = height; } };
            }
            if (typeof globalThis.Path2D === 'undefined') {
                globalThis.Path2D = class Path2D {
                    constructor() { this._ops = []; }
                    moveTo(x, y) { this._ops.push(['moveTo', x, y]); }
                    lineTo(x, y) { this._ops.push(['lineTo', x, y]); }
                    bezierCurveTo(...args) { this._ops.push(['bezierCurveTo', ...args]); }
                    quadraticCurveTo(...args) { this._ops.push(['quadraticCurveTo', ...args]); }
                    arc(...args) { this._ops.push(['arc', ...args]); }
                    rect(x, y, w, h) { this._ops.push(['rect', x, y, w, h]); }
                    closePath() { this._ops.push(['closePath']); }
                    addPath(p) { if (p && p._ops) this._ops.push(...p._ops); }
                };
            }
        } catch (polyErr) {
        }
        let __orig_console_warn;
        try {
            __orig_console_warn = console.warn;
            console.warn = (...args) => {
                try {
                    const txt = args.map(String).join(' ');
                    if (/Cannot access the `require` function|^TT:|TT: undefined function|TT: invalid function id/.test(txt)) return;
                } catch (e) { }
                __orig_console_warn(...args);
            };
        } catch (e) { }
        try {
            const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
            const { createCanvas } = await import('canvas');
            const data = new Uint8Array(fs.readFileSync(filename));
            const loadingTask = pdfjsLib.getDocument({ data, disableWorker: true });
            const pdfDocument = await loadingTask.promise;
            const numPages = pdfDocument.numPages;
            const pageCosts = await Promise.all(
                Array.from({ length: numPages }).map(async (_, idx) => {
                    const pageNumber = idx + 1;
                    const page = await pdfDocument.getPage(pageNumber);
                    const viewport = page.getViewport({ scale: 1 });
                    const scale = TARGET_WIDTH / viewport.width;
                    const scaledViewport = page.getViewport({ scale });
                    const canvas = createCanvas(Math.round(scaledViewport.width), Math.round(scaledViewport.height));
                    const ctx = canvas.getContext('2d');
                    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
                    const pngBuffer = canvas.toBuffer('image/png');
                    return analyzePngBuffer(pngBuffer);
                })
            );
            return pageCosts;
        } finally {
            try { if (typeof __orig_console_warn === 'function') console.warn = __orig_console_warn; } catch (e) { }
        }
    } catch (nodeErr) {
        try {
            const puppeteer = await import('puppeteer');
            const http = await import('http');
            const url = await import('url');
            const server = http.createServer((req, res) => {
                const parsed = url.parse(req.url || '', true);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                if (req.method === 'OPTIONS') {
                    res.writeHead(204);
                    return res.end();
                }
                if (parsed.pathname === '/__pdf_temp') {
                    try {
                        const stat = fs.statSync(filename);
                        res.writeHead(200, {
                            'Content-Type': 'application/pdf',
                            'Content-Length': String(stat.size),
                            'Cache-Control': 'no-store'
                        });
                        const stream = fs.createReadStream(filename);
                        stream.on('error', (err) => {
                            console.error('[printingPrice] stream error:', err);
                            if (!res.headersSent) res.writeHead(500);
                            try { res.end('error'); } catch (e) { }
                        });
                        stream.pipe(res);
                    } catch (e) {
                        console.error('[printingPrice] serve error:', e);
                        res.writeHead(500);
                        res.end('error');
                    }
                } else {
                    res.writeHead(404);
                    res.end('not found');
                }
            });
            await new Promise((resolve, reject) => {
                server.listen(0, '127.0.0.1', () => resolve());
                server.once('error', reject);
            });
            const addr = server.address();
            const port = typeof addr === 'string' ? parseInt(addr, 10) : (addr && addr.port) || 0;
            const browser = await puppeteer.launch(
                process.env.PUPPETEER_EXECUTABLE_PATH ?{
                    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                } : {}
            );
            const page = await browser.newPage();
            try {
                page.on('console', msg => {
                    try {
                        const text = msg.text();
                        if (/Cannot access the `require` function|^TT:|TT: undefined function|TT: invalid function id/.test(text)) return;
                        const type = msg.type();
                        if (type === 'error') console.error('[page]', text);
                        else if (type === 'warning') console.warn('[page]', text);
                        else console.log('[page]', text);
                    } catch (e) { }
                });
            } catch (e) { }
            const polyfillScript = `(() => {
                try {
                    if (!window.DOMMatrix) {
                        window.DOMMatrix = class DOMMatrix { constructor(){} multiply(){return this} translate(){return this} scale(){return this} rotate(){return this} };
                    }
                    if (!window.ImageData) {
                        window.ImageData = class ImageData { constructor(data, width, height) { this.data = data; this.width = width; this.height = height; } };
                    }
                    if (!window.Path2D) {
                        window.Path2D = class Path2D { constructor(){ this._ops = [] } moveTo(x,y){this._ops.push(['moveTo',x,y])} lineTo(x,y){this._ops.push(['lineTo',x,y])} bezierCurveTo(...a){this._ops.push(['bezier',...a])} quadraticCurveTo(...a){this._ops.push(['quad',...a])} arc(...a){this._ops.push(['arc',...a])} rect(x,y,w,h){this._ops.push(['rect',x,y,w,h])} closePath(){this._ops.push(['close'])} addPath(p){ if(p&&p._ops) this._ops.push(...p._ops) } };
                    }
                } catch(e) {}
            })();`;
            try {
                if (typeof page.addInitScript === 'function') {
                    await page.addInitScript({ content: polyfillScript });
                } else if (typeof page.evaluateOnNewDocument === 'function') {
                    await page.evaluateOnNewDocument(polyfillScript);
                } else {
                    console.warn('[printingPrice] page.addInitScript / evaluateOnNewDocument not available; injecting polyfill after navigation');
                    await page.evaluate(polyfillScript).catch(() => { });
                }
            } catch (initErr) {
                console.warn('[printingPrice] could not inject init polyfill into page:', initErr && initErr.message);
            }
            await page.setContent('<!doctype html><html><head><meta charset="utf-8"/></head><body></body></html>', { waitUntil: 'load' });
            const cdnUrls = [
                'https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js'
            ];
            let loaded = false;
            for (const u of cdnUrls) {
                try {
                    await page.addScriptTag({ url: u });
                    loaded = true;
                    break;
                } catch (e) {
                    console.warn('[printingPrice] addScriptTag failed for', u, e && e.message);
                }
            }
            if (!loaded) throw new Error('Could not load pdfjs from any CDN');
            const pagesB64 = await page.evaluate(async (port, TARGET_WIDTH) => {
                try {
                    const pdfjs = window.pdfjsLib || window['pdfjs-dist/build/pdf'] || window['pdfjs-dist/build/pdf.min'] || window['pdfjs-dist'];
                    if (!pdfjs) throw new Error('pdfjs not available in page');
                    const resp = await fetch('http://127.0.0.1:' + port + '/__pdf_temp');
                    if (!resp.ok) throw new Error('fetch failed: ' + resp.status);
                    const arrayBuffer = await resp.arrayBuffer();
                    const pdfBytes = new Uint8Array(arrayBuffer);
                    const pdf = await pdfjs.getDocument({ data: pdfBytes }).promise;
                    const results = [];
                    for (let p = 1; p <= pdf.numPages; p++) {
                        const page = await pdf.getPage(p);
                        const viewport = page.getViewport({ scale: 1 });
                        const scale = Math.max(0.1, TARGET_WIDTH / viewport.width);
                        const sv = page.getViewport({ scale });
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.round(sv.width);
                        canvas.height = Math.round(sv.height);
                        const ctx = canvas.getContext('2d');
                        await page.render({ canvasContext: ctx, viewport: sv }).promise;
                        results.push(canvas.toDataURL('image/png').split(',')[1]);
                    }
                    return results;
                } catch (e) {
                    throw e;
                }
            }, port, TARGET_WIDTH);
            await browser.close();
            server.close();
            const pageCosts = [];
            for (const b64 of pagesB64) {
                const buf = Buffer.from(b64, 'base64');
                pageCosts.push(await analyzePngBuffer(buf));
            }
            return pageCosts;
        } catch (puppErr) {
            console.error('printingPrice - both pdfjs/node-canvas and puppeteer fallbacks failed:', nodeErr, puppErr);
            throw puppErr;
        }
    };
};

const printingPrice = async (filename) => {
    const pageCosts = await analyzePdfPages(filename);
    return Array.isArray(pageCosts) ? pageCosts.reduce((a, b) => a + b, 0) : pageCosts;
};

export { analyzePdfPages };
export default printingPrice;
