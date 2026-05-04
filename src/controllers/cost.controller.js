const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const service = require('../services/cost.service');

const listCosts = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['period', 'category', 'wbsItemId']);
    const data = await service.listCosts(req.params.projectId, filter);
    res.json({
        status: 'success',
        data
    });
});
const createCost = catchAsync(async (req, res) => { const data = await service.createCost(req.params.projectId, req.body); res.status(201).json({ status: 'success', data }); });
const updateCost = catchAsync(async (req, res) => { const data = await service.updateCost(req.params.id, req.body); res.json({ status: 'success', data }); });
const approveCost = catchAsync(async (req, res) => { const data = await service.approveCost(req.params.id, req.body.action); res.json({ status: 'success', data }); });

module.exports = { listCosts, createCost, updateCost, approveCost };
