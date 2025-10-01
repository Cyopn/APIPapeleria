export const notFoundMiddleware = (router) => {
    let routes = []
    return function (req, res, next) {
        router.stack.forEach(e => {
            if (e.path !== undefined) {
                e.handle.stack.forEach(e => {
                    if (e.route.path !== undefined) {
                        routes.push(e.route.path.replace("/", ""))
                    }
                })
            }
        });
        if ((routes.indexOf(req.url.split("/").pop())) === -1) return res.status(404).json({ error: "Recurso no encontrado" });
        next();
        routes = [];
    }
};
