const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const progressUpdateService = require('../services/progressUpdate.service');

const createProgressUpdate = catchAsync(async (req, res) => {
    const update = await progressUpdateService.createProgressUpdate(req.body, req.user.id);
    res.status(201).json({
        status: 'success',
        message: 'Gửi báo cáo tiến độ thành công',
        data: update
    });
});

const getProgressUpdates = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['projectId', 'wbsItemId', 'status', 'reportedBy']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    if (!options.sortBy) {
        options.sortBy = 'reportDate:desc';
    }

    const result = await progressUpdateService.queryProgressUpdates(filter, options);
    res.status(200).json({
        status: 'success',
        data: result
    });
});

const approveProgressUpdate = catchAsync(async (req, res) => {
    const { status, note } = req.body;
    const update = await progressUpdateService.approveProgressUpdateById(
        req.params.updateId,
        status,
        req.user.id,
        note
    );
    res.status(200).json({
        status: 'success',
        message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} báo cáo`,
        data: update
    });
});

module.exports = {
    createProgressUpdate,
    getProgressUpdates,
    approveProgressUpdate
};