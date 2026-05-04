const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const service = require('../services/equipment.service');

const list = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['type', 'status', 'search']);
    const options = pick(req.query, ['page', 'limit']);

    const data = await service.list(filter, options);

    res.json({
        status: 'success',
        data
    });
});

const create = catchAsync(async (req, res) => {
    const data = await service.create(req.body, req.user.id);

    res.status(201).json({
        status: 'success',
        data
    });
});

const getById = catchAsync(async (req, res) => {
    const data = await service.getById(req.params.id);

    res.json({
        status: 'success',
        data
    });
});

const update = catchAsync(async (req, res) => {
    const data = await service.update(req.params.id, req.body);

    res.json({
        status: 'success',
        data
    });
});

const remove = catchAsync(async (req, res) => {
    await service.remove(req.params.id);

    res.json({
        status: 'success'
    });
});

const assign = catchAsync(async (req, res) => {
    const data = await service.assign(req.params.id, req.body, req.user.id);

    res.status(201).json({
        status: 'success',
        data
    });
});
const createLog = catchAsync(async (req, res) => {
    const data = await service.createLog(req.params.id, req.body);

    res.status(201).json({
        status: 'success',
        data
    });
});
const listLogs = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['projectId', 'dateFrom', 'dateTo']);
    const options = pick(req.query, ['page', 'limit']);

    const data = await service.listLogs(req.params.id, filter, options);

    res.json({
        status: 'success',
        data
    });
});

module.exports = {
    list,
    create,
    getById,
    update,
    remove,
    assign,
    createLog,
    listLogs
}
