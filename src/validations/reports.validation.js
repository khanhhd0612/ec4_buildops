const Joi = require('joi');
const { objectId } = require('./custom.validation');

const baseProjectParams = Joi.object().keys({
    projectId: Joi.string().custom(objectId).required(),
});

const progressReport = {
    params: baseProjectParams,
    query: Joi.object().keys({
        dateFrom: Joi.date(),
        dateTo: Joi.date(),
        wbsItemId: Joi.string().custom(objectId),
    }),
};

const costReport = {
    params: baseProjectParams,
    query: Joi.object().keys({
        period: Joi.string().pattern(/^\d{4}-\d{2}$/),
        category: Joi.string(),
    }),
};

const materialReport = {
    params: baseProjectParams,
    query: Joi.object().keys({
        dateFrom: Joi.date(),
        dateTo: Joi.date(),
        materialId: Joi.string().custom(objectId),
    }),
};

const attendanceReport = {
    params: baseProjectParams,
    query: Joi.object().keys({
        userId: Joi.string().custom(objectId),
        dateFrom: Joi.date(),
        dateTo: Joi.date(),
    }),
};

const exportReport = {
    params: baseProjectParams,
    query: Joi.object().keys({
        type: Joi.string().valid('progress', 'cost', 'material', 'attendance').required(),
        format: Joi.string().valid('xlsx', 'pdf').default('xlsx'),
        dateFrom: Joi.date(),
        dateTo: Joi.date(),
    }),
};

const insight = {
    params: baseProjectParams,
};

module.exports = {
    progressReport,
    costReport,
    materialReport,
    attendanceReport,
    exportReport,
    insight,
};
