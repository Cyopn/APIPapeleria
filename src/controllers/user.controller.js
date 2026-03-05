import userService from "../services/user.service.js";

export const createUser = async (req, res, next) => {
    try {
        const user = await userService.create(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

export const listUsers = async (req, res, next) => {
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const users = await userService.findAll(baseUrl);
        res.json(users);
    } catch (err) {
        next(err);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const user = await userService.findOne(id, baseUrl);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const result = await userService.update(id, req.body, {
            baseUrl
        });
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await userService.remove(id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const token = await userService.login(req.body, baseUrl);
        res.json(token);
    } catch (err) {
        next(err);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = Number(id);
        const result = await userService.changePassword(userId, req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
