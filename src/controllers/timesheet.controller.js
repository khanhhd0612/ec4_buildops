const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const service = require('../services/timesheet.service');

const listEmployees = catchAsync(async (req, res) => {
    const data = await service.listEmployees(req.params.projectId, pick(req.query, ['page', 'limit', 'search']));

    res.json({
        status: 'success',
        data
    });
});

const addEmployee = catchAsync(async (req, res) => {
    const data = await service.addEmployee(req.params.projectId, req.body);

    res.status(201).json({
        status: 'success',
        data
    });
});

const updateEmployee = catchAsync(async (req, res) => {
    const data = await service.updateEmployee(req.params.projectId, req.params.userId, req.body);

    res.json({
        status: 'success',
        data
    });
});

const removeEmployee = catchAsync(async (req, res) => {
    await service.removeEmployee(req.params.projectId, req.params.userId);

    res.json({
        status: 'success',
        message: 'Xóa nhân công khỏi dự án thành công'
    });
});

const listTimesheets = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['userId', 'workDate', 'dateFrom', 'dateTo', 'status']);
    const options = pick(req.query, ['page', 'limit']);

    const data = await service.listTimesheets(req.params.projectId, filter, options);

    res.json({
        status: 'success',
        data
    });
});

const createTimesheets = catchAsync(async (req, res) => {
    const data = await service.createTimesheets(req.params.projectId, req.body);

    res.status(201).json({
        status: 'success',
        data
    });
});

const updateTimesheet = catchAsync(async (req, res) => {
    const data = await service.updateTimesheet(req.params.id, req.body);

    res.json({
        status: 'success',
        data
    });
});

const approveTimesheet = catchAsync(async (req, res) => {
    const data = await service.approveTimesheet(req.params.id, req.body, req.user.id);

    res.json({
        status: 'success',
        data
    });
});

module.exports = {
    listEmployees,
    addEmployee,
    updateEmployee,
    removeEmployee,
    listTimesheets,
    createTimesheets,
    updateTimesheet,
    approveTimesheet
}