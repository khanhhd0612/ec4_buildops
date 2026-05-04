const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const service = require('../services/siteDiary.service');

const list = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['dateFrom', 'dateTo', 'createdBy', 'status']);
    const options = pick(req.query, ['page', 'limit']);

    const data = await service.listSiteDiaries(req.params.projectId, filter, options);

    res.json({
        status: 'success',
        data
    });
});

const create = catchAsync(async (req, res) => {
    const data = await service.createSiteDiary(req.params.projectId, req.body, req.user.id);

    res.status(201).json({
        status: 'success',
        data
    });
});

const getById = catchAsync(async (req, res) => {
    const data = await service.getSiteDiary(req.params.id);

    res.json({
        status: 'success',
        data
    });
});

const update = catchAsync(async (req, res) => {
    const data = await service.updateSiteDiary(req.params.id, req.body);

    res.json({
        status: 'success',
        data
    });
});

const approve = catchAsync(async (req, res) => {
    const data = await service.approveSiteDiary(req.params.id, req.body, req.user.id);

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