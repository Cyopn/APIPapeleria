/*
    Script de automatización para crear: files -> products (items)
    - Lee los JSON en `prods/seed_files.json`, `prods/seed_products.json`, `prods/seed_items.json`
    - Para cada entry en seed_files: descarga el blob de `prods/images/<filename>` y lo sube a
        `POST /api/file-manager?service=<service>` (envía FormData)
    - Usa la respuesta del upload para crear el registro en `POST /api/files` (requiere filename, type, filehash)
    - Guarda mapping filename -> id_file
    - Crea products con `POST /api/products` usando `id_file` cuando aplique

    Nota: este script está pensado para ejecutarse desde el navegador cuando la carpeta `app/`
    está siendo servida (por ejemplo con un servidor estático). Los JSON e imágenes deben ser
    accesibles desde la misma origen como `./prods/…`.
*/

const apiBase = "https://noninitial-chirurgical-judah.ngrok-free.dev/api"; // Cambia si usas otro host
const AUTH_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJjaGlwIiwiaWF0IjoxNzcwOTk2OTkwfQ.uSlvZUbZ3Orsy_PBLrdw5hvh_lA5hBYoe5hqetaysrk";
const DEFAULT_USER_ID = 1;

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error al obtener ${url}: ${res.status} ${res.statusText}`);
    return res.json();
}

async function uploadFileBlob(blob, filename, service) {
    const fd = new FormData();
    fd.append("files", blob, filename);
    fd.append("username", "chip");

    const url = `${apiBase}/file-manager?service=${encodeURIComponent(service)}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Authorization': AUTH_TOKEN
        },
        body: fd
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed ${res.status}: ${text}`);
    }
    const data = await res.json();
    // La API a veces devuelve un arreglo o un objeto; normalizamos al primer objeto
    return Array.isArray(data) ? data[0] : data;
}

async function createFileRecord(originalName, service, storedName) {
    const url = `${apiBase}/files`;
    const body = { id_user: DEFAULT_USER_ID, filename: originalName, type: service, filehash: storedName };
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create file record failed ${res.status}: ${text}`);
    }
    return res.json();
}

async function createProduct(payload) {
    const url = `${apiBase}/products`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create product failed ${res.status}: ${text}`);
    }
    return res.json();
}

function mapKeyFromFilename(filename) {
    // Normaliza nombres para mapping: quita rutas y deja basename
    return filename.split('/').pop();
}

async function runSeedAutomation() {
    try {
        console.log('Cargando seed_files.json...');
        const seedFiles = await fetchJson('./prods/seed_files.json');

        const fileIdMap = {}; // filename (basename) -> id_file

        for (const entry of seedFiles) {
            // Esperamos que cada entry tenga al menos: filename, service (type)
            const filename = entry.filename || entry.file || entry.name;
            const service = entry.service || entry.type || 'file';
            if (!filename) {
                console.warn('Entry sin filename, se omite:', entry);
                continue;
            }

            const base = mapKeyFromFilename(filename);
            const imageUrl = `./prods/images/${base}`;
            console.log(`Descargando blob de ${imageUrl} para servicio ${service}...`);
            const resp = await fetch(imageUrl);
            if (!resp.ok) {
                console.warn(`No se encontró ${imageUrl}: ${resp.status}`);
                continue;
            }
            const blob = await resp.blob();

            console.log(`Subiendo ${base} a file-manager (service=${service})...`);
            const uploadRes = await uploadFileBlob(blob, base, service);
            console.log('Respuesta upload:', uploadRes);

            // Extraer campos retornados (varían según la implementación)
            const originalName = uploadRes.originalName || uploadRes.originalname || base;
            const storedName = uploadRes.storedName || uploadRes.storedName || uploadRes.storedname || uploadRes.filename || uploadRes.stored || uploadRes.hash || uploadRes.stored_file;
            const returnedService = uploadRes.service || service;

            // Luego crear registro en /files (usa originalName, service, storedName)
            console.log('Creando registro en /files para', originalName);
            const fileRecord = await createFileRecord(originalName, returnedService, storedName);
            console.log('File record creado:', fileRecord);

            // Guardar id devuelto (puede venir como id, id_file, insertId, etc.)
            const id = fileRecord.id || fileRecord.id_file || fileRecord.insertId || (fileRecord[0] && (fileRecord[0].id || fileRecord[0].id_file));
            if (!id) {
                console.warn('No se obtuvo id del registro de file. Guarda el objeto entero como referencia.');
                fileIdMap[base] = fileRecord;
            } else {
                fileIdMap[base] = id;
            }
        }

        console.log('Todos los archivos procesados. Mapeo:', fileIdMap);

        // Ahora creamos productos
        console.log('Cargando seed_products.json...');
        const seedProducts = await fetchJson('./prods/seed_products.json');

        const productIdMap = {};
        for (const p of seedProducts) {
            // Si el seed hace referencia a un archivo por nombre (o varios), mapeamos a id_file / id_files
            const payload = Object.assign({}, p);
            const fref = payload.filename || payload.file || payload.fileName;
            if (fref) {
                const names = Array.isArray(fref) ? fref : [fref];
                const ids = names.map(n => {
                    const base = mapKeyFromFilename(n);
                    return fileIdMap[base];
                }).filter(Boolean);
                if (!payload.id_file && ids.length === 1) payload.id_file = ids[0];
                if (ids.length > 0) payload.id_files = ids;
            }

            console.log('Creando product con payload:', payload);
            const prodRes = await createProduct(payload);
            console.log('Producto creado:', prodRes);
            // Extraer id
            const pid = prodRes.id_item || prodRes.id_product || prodRes.id || (prodRes[0] && (prodRes[0].id_item || prodRes[0].id_product || prodRes[0].id));
            if (p.name) productIdMap[p.name] = pid;
            else if (p.title) productIdMap[p.title] = pid;
        }

        console.log('Products creados. Mapeo:', productIdMap);

        // Por compatibilidad, también procesamos seed_items.json (puede contener items tipo 'item')
        try {
            console.log('Cargando seed_items.json (opcional)...');
            const seedItems = await fetchJson('./prods/seed_items.json');
            for (const it of seedItems) {
                const payload = Object.assign({}, it);
                if (!payload.type) payload.type = 'item';
                if (!payload.id_file && (payload.filename || payload.file)) {
                    const base = mapKeyFromFilename(payload.filename || payload.file);
                    if (fileIdMap[base]) payload.id_file = fileIdMap[base];
                }
                console.log('Creando item/product (type=item) payload:', payload);
                const res = await createProduct(payload);
                console.log('Item creado:', res);
            }
        } catch (err) {
            console.log('No se encontró seed_items.json o hubo error procesándolo (se omite):', err.message);
        }

        console.log('Automatización completa. Revisa la salida para verificar IDs y errores.');
    } catch (err) {
        console.error('Error en runSeedAutomation:', err);
    }
}

// Ejecutar automáticamente al cargar el script (si deseas desactivar, comenta la línea siguiente)
runSeedAutomation();

// También podemos exponer la función globalmente para llamarla manualmente desde la consola
window.runSeedAutomation = runSeedAutomation;