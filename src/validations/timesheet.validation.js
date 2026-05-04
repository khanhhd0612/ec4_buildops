const Joi = require('joi');
const { objectId } = require('./custom.validation');

const employeeBody = Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    role: Joi.string().valid('owner', 'pm', 'engineer', 'supervisor', 'warehouse', 'viewer').default('viewer'),
    dailyRate: Joi.number().min(0).default(0),
});

const listEmployees = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    query: Joi.object().keys({
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
        search: Joi.string().allow('', null),
    }),
};

const addEmployee = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    body: employeeBody,
};

const updateEmployee = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
        userId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        role: Joi.string().valid('owner', 'pm', 'engineer', 'supervisor', 'warehouse', 'viewer'),
        dailyRate: Joi.number().min(0),
    }).min(1),
};

const removeEmployee = updateEmployee;

const listTimesheets = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    query: Joi.object().keys({
        userId: Joi.string().custom(objectId),
        workDate: Joi.date(),
        dateFrom: Joi.date(),
        dateTo: Joi.date(),
        status: Joi.string().valid('pending', 'approved', 'rejected'),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const createTimesheets = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        records: Joi.array().items(Joi.object().keys({
            userId: Joi.string().custom(objectId).required(),
            workDate: Joi.date().required(),
            checkInTime: Joi.date(),
            checkOutTime: Joi.date(),
            type: Joi.string().valid('regular', 'overtime', 'leave', 'absent').default('regular'),
            photoUrl: Joi.string().uri().allow('', null),
            checkInLocation: Joi.object().keys({ lat: Joi.number().required(), lng: Joi.number().required() }),
            note: Joi.string().allow('', null).max(5000),
        })).min(1).required(),
    }),
};

const updateTimesheet = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        checkInTime: Joi.date(),
        checkOutTime: Joi.date(),
        type: Joi.string().valid('regular', 'overtime', 'leave', 'absent'),
        note: Joi.string().allow('', null).max(5000),
    }).min(1),
};

const approveTimesheet = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        action: Joi.string().valid('approve', 'reject').required(),
        note: Joi.string().allow('', null).max(5000),
    }),
};

module.exports = {
    listEmployees,
    addEmployee,
    updateEmployee,
    removeEmployee,
    listTimesheets,
    createTimesheets,
    updateTimesheet,
    approveTimesheet,
};
