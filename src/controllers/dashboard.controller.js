const catchAsync = require('../utils/catchAsync');
const service = require('../services/dashboard.service');

const summary = catchAsync(async (req, res) => {
    const data = await service.getSummary(req.user);

    res.json({
        status: 'success',
        data
    });
});

const alerts = catchAsync(async (req, res) => {
    const data = await service.getAlerts(req.user);

    res.json({
        status: 'success',
        data
    });
});

const activities = catchAsync(async (req, res) => {
    const data = await service.getActivities(req.user, req.query);

    res.json({
        status: 'success',
        data
    });
});

module.exports = {
    summary,
    alerts,
    activities,
};
