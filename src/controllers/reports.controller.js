const catchAsync = require('../utils/catchAsync');
const service = require('../services/reports.service');

const getProgress = catchAsync(async (req, res) => {
    const data = await service.getProgressReport(req.params.projectId, req.query);

    res.json({
        status: 'success',
        data
    });
});

const getCost = catchAsync(async (req, res) => {
    const data = await service.getCostReport(req.params.projectId, req.query);

    res.json({
        status: 'success',
        data
    });
});

const getMaterial = catchAsync(async (req, res) => {
    const data = await service.getMaterialReport(req.params.projectId, req.query);

    res.json({
        status: 'success',
        data
    });
});

const getAttendance = catchAsync(async (req, res) => {
    const data = await service.getAttendanceReport(req.params.projectId, req.query);

    res.json({
        status: 'success',
        data
    });
});

const getInsight = catchAsync(async (req, res) => {
    const data = await service.getInsight(req.params.projectId);

    res.json({
        status: 'success',
        data
    });
});

const exportReport = catchAsync(async (req, res) => {
    const workbook = await service.exportReport(req.params.projectId, req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${req.query.type || 'report'}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
});

module.exports = {
    getProgress,
    getCost,
    getMaterial,
    getAttendance,
    exportReport,
    getInsight
};
