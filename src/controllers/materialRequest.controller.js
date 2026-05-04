const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const service = require('../services/materialRequest.service');

const list = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['status', 'search']);
    const options = pick(req.query, ['page', 'limit']);

    const result = await service.list(req.params.projectId, filter, options);

    res.json({
        status: 'success',
        data: result
    });
});

const create = catchAsync(async (req, res) => {
    const data = await service.create(req.params.projectId, req.body, req.user.id);

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
const approve = catchAsync(async (req, res) => {
    const data = await service.approve(req.params.id, req.body, req.user.id);

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
    approve
}