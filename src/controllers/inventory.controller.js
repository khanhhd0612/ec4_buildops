const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const service = require('../services/inventory.service');

const listStocks = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['materialId', 'category']);
    const options = pick(req.query, ['page', 'limit']);

    const data = await service.listStocks(req.params.projectId, filter, options);

    res.json({
        status: 'success',
        data
    });
});
const createTransaction = catchAsync(async (req, res) => {
    const data = await service.createTransaction(req.params.projectId, req.body, req.user.id);

    res.status(201).json({
        status: 'success',
        data
    });
});
const listTransactions = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['type', 'materialId', 'fromDate', 'toDate']);
    const options = pick(req.query, ['page', 'limit']);
    const data = await service.listTransactions(req.params.projectId, filter, options);

    res.json({
        status: 'success',
        data
    });
});

module.exports = {
    listStocks,
    createTransaction,
    listTransactions
}
