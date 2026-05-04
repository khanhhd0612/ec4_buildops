const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const acceptanceService = require('../services/acceptance.service');

const listAcceptance = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['contractId', 'status', 'type']);
    const options = pick(req.query, ['page', 'limit']);
    const result = await acceptanceService.listAcceptance(req.params.projectId, filter, options);

    res.status(200).json({
        status: 'success',
        data: {
            results: result.results,
            totalResults: result.totalResults,
        },
    });
});

const createAcceptance = catchAsync(async (req, res) => {
    const record = await acceptanceService.createAcceptance(req.params.projectId, req.body, req.user.id);
    res.status(201).json({
        status: 'success',
        message: 'Tạo biên bản nghiệm thu thành công',
        data: record,
    });
});

const getAcceptance = catchAsync(async (req, res) => {
    const record = await acceptanceService.getAcceptanceById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: record,
    });
});

const updateAcceptance = catchAsync(async (req, res) => {
    const record = await acceptanceService.updateAcceptance(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        message: 'Cập nhật biên bản nghiệm thu thành công',
        data: record,
    });
});

const approveAcceptance = catchAsync(async (req, res) => {
    const record = await acceptanceService.approveAcceptance(req.params.id, req.body.action, req.body.rejectionNote, req.user.id);
    res.status(200).json({
        status: 'success',
        message: 'Xử lý workflow nghiệm thu thành công',
        data: record,
    });
});

module.exports = {
    listAcceptance,
    createAcceptance,
    getAcceptance,
    updateAcceptance,
    approveAcceptance,
};
