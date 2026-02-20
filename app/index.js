const apiBase = "http://localhost:4000/api";
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
    return filename.split('/').pop();
}

async function runSeedAutomation() {
    try {
        console.log('Cargando seed_files.json...');
        const seedFiles = await fetchJson('./prods/seed_files.json');

        const fileIdMap = {};

        for (const entry of seedFiles) {
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

            const originalName = uploadRes.originalName || uploadRes.originalname || base;
            const storedName = uploadRes.storedName || uploadRes.storedName || uploadRes.storedname || uploadRes.filename || uploadRes.stored || uploadRes.hash || uploadRes.stored_file;
            const returnedService = uploadRes.service || service;

            console.log('Creando registro en /files para', originalName);
            const fileRecord = await createFileRecord(originalName, returnedService, storedName);
            console.log('File record creado:', fileRecord);

            const id = fileRecord.id || fileRecord.id_file || fileRecord.insertId || (fileRecord[0] && (fileRecord[0].id || fileRecord[0].id_file));
            if (!id) {
                console.warn('No se obtuvo id del registro de file. Guarda el objeto entero como referencia.');
                fileIdMap[base] = fileRecord;
            } else {
                fileIdMap[base] = id;
            }
        }

        console.log('Todos los archivos procesados. Mapeo:', fileIdMap);

        console.log('Cargando seed_products.json...');
        const seedProducts = await fetchJson('./prods/seed_products.json');

        const productIdMap = {};
        for (let i = 0; i < seedProducts.length; i++) {
            const p = seedProducts[i];
            const payload = Object.assign({}, p);
            if (typeof p.category !== 'undefined') payload.category = p.category;
            if (payload.type === 'item' && (typeof payload.category === 'undefined' || payload.category === null)) {
                const sf = Array.isArray(seedFiles) && seedFiles[i] ? seedFiles[i] : null;
                if (sf && typeof sf.category !== 'undefined') payload.category = sf.category;
            }
            let fref = payload.filename || payload.file || payload.fileName;
            if (!fref && Array.isArray(seedFiles) && seedFiles[i]) {
                fref = seedFiles[i].filename || seedFiles[i].file || seedFiles[i].name;
            }
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
            const pid = prodRes.id_item || prodRes.id_product || prodRes.id || (prodRes[0] && (prodRes[0].id_item || prodRes[0].id_product || prodRes[0].id));
            if (p.name) productIdMap[p.name] = pid;
            else if (p.title) productIdMap[p.title] = pid;
        }

        console.log('Products creados. Mapeo:', productIdMap);


        console.log('Automatización completa. Revisa la salida para verificar IDs y errores.');
    } catch (err) {
        console.error('Error en runSeedAutomation:', err);
    }
}

runSeedAutomation();

window.runSeedAutomation = runSeedAutomation;