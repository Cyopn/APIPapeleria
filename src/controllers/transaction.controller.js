import transactionService from "../services/transaction.service.js";

export const createTransaction = async (req, res, next) => {
    try {
        const transaction = await transactionService.create(req.body);
        res.status(201).json(transaction);
    } catch (err) {
        next(err);
    }
};

export const listTransactions = async (req, res, next) => {
    try {
        const transactions = await transactionService.findAll();
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

export const getTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await transactionService.findOne(id);
        res.json(transaction);
    } catch (err) {
        next(err);
    }
};

export const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await transactionService.update(id, req.body);
        res.json(transaction);
    } catch (err) {
        next(err);
    }
};

export const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await transactionService.remove(id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
