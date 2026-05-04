const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProgressUpdate = {
    body: Joi.object().keys({
        wbsItemId: Joi.string().custom(objectId).required(),
        reportDate: Joi.date().required(),
        completedQty: Joi.number().min(0).default(0),
        completionPct: Joi.number().min(0).max(100).required(),
        note: Joi.string().allow('', null),
        issues: Joi.string().allow('', null),
        photos: Joi.array().items(
            Joi.object().keys({
                url: Joi.string().uri().required(),
                caption: Joi.string().allow('', null),
                takenAt: Joi.date()
            })
        ).max(10),
        status: Joi.string().valid('draft', 'submitted').default('submitted')
    })
};

const getProgressUpdates = {
    query: Joi.object().keys({
        wbsItemId: Joi.string().custom(objectId),
        projectId: Joi.string().custom(objectId),
        status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected'),
        reportedBy: Joi.string().custom(objectId),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    })
};

const approveProgressUpdate = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(), // ID của WBS Item
        updateId: Joi.string().custom(objectId).required(), // ID của báo cáo
    }),
    body: Joi.object().keys({
        status: Joi.string().valid('approved', 'rejected').required(),
        note: Joi.string().allow('', null)
    })
};

module.exports = {
    createProgressUpdate,
    getProgressUpdates,
    approveProgressUpdate
};