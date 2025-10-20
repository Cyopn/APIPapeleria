export const notFoundMiddleware = (router) => {
    // Construye lista de rutas completas y sus métodos permitidos
    const routes = [];

    const joinPaths = (a = '', b = '') => {
        return ('/' + [a, b].map(p => String(p || '')).join('/')).replace(/\/+/g, '/').replace(/\/\/$/, '/').replace(/\/$/, '') || '/';
    };

    const pathToRegex = (p) => {
        // escape regex except express params like :id
        let pattern = p.replace(/([.+?^=!:${}()|[\]\/\\])/g, '\\$1');
        // convert \:param to ([^/]+)
        pattern = pattern.replace(/\\:([a-zA-Z0-9_]+)/g, '([^/]+)');
        return new RegExp('^' + pattern + '$');
    };

    // Recorre el router y obtiene rutas completas
    const traverse = (r, prefix = '') => {
        if (!r || !r.stack) return;
        r.stack.forEach(layer => {
            if (layer.route && layer.route.path) {
                const methods = layer.route.methods ? Object.keys(layer.route.methods).map(m => m.toUpperCase()) : [];
                const full = joinPaths(prefix, layer.route.path);
                routes.push({ path: full, regex: pathToRegex(full), methods: new Set(methods) });
            } else if (layer.name === 'router' && layer.handle) {
                // intentar obtener el mount path si está disponible
                const mountPath = layer.path || (layer.regexp && layer.regexp.source ? layer.regexp.source : '');
                // si mountPath parece un regex, intentamos extraer literal /prefix
                let mount = '';
                if (typeof mountPath === 'string' && mountPath && !mountPath.startsWith('^')) mount = mountPath;
                else if (typeof mountPath === 'string') {
                    // intentar extraer /prefix desde regexp source: \\/prefix\\\/?
                    const m = mountPath.match(/\\\/([^\\/\^\$\?\(\)\[\]\|]+)/);
                    if (m) mount = '/' + m[1];
                }
                traverse(layer.handle, joinPaths(prefix, mount));
            }
        });
    };

    traverse(router, '');

    return function (req, res, next) {
        const reqPath = req.path || req.url || '/';

        // buscar ruta exacta (respetando params)
        const match = routes.find(r => r.regex.test(reqPath));
        if (!match) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }

        if (!match.methods.has(req.method)) {
            const allow = Array.from(match.methods).join(', ');
            res.set('Allow', allow);
            return res.status(405).json({ error: 'Método no permitido', allowed: allow });
        }

        return next();
    };
};
