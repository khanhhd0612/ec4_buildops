const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createWbsItem = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        parentId: Joi.string().custom(objectId).allow(null),
        code: Joi.string().allow('', null),
        name: Joi.string().required().trim(),
        unit: Joi.string().allow('', null),
        description: Joi.string().allow('', null),

        plannedStart: Joi.date(),
        plannedEnd: Joi.date().min(Joi.ref('plannedStart')),
        plannedQty: Joi.number().min(0),
        plannedCost: Joi.number().min(0),
        weightPct: Joi.number().min(0).max(100),

        status: Joi.string().valid('not_started', 'in_progress', 'completed', 'delayed', 'paused'),
        assignees: Joi.array().items(Joi.string().custom(objectId)),

        dependencies: Joi.array().items(
            Joi.object().keys({
                predecessorId: Joi.string().custom(objectId).required(),
                type: Joi.string().valid('FS', 'SS', 'FF', 'SF').default('FS'),
                lagDays: Joi.number().default(0)
            })
        ),
        notes: Joi.string().allow('', null)
    })
};

const getProjectWbs = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    })
};

const getWbsItem = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    })
};

const updateWbsItem = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        code: Joi.string().allow('', null),
        name: Joi.string().trim(),
        unit: Joi.string().allow('', null),
        description: Joi.string().allow('', null),

        plannedStart: Joi.date(),
        plannedEnd: Joi.date(),
        plannedQty: Joi.number().min(0),
        plannedCost: Joi.number().min(0),
        weightPct: Joi.number().min(0).max(100),

        actualStart: Joi.date(),
        actualEnd: Joi.date(),
        actualQty: Joi.number().min(0),
        actualCost: Joi.number().min(0),
        completionPct: Joi.number().min(0).max(100),

        status: Joi.string().valid('not_started', 'in_progress', 'completed', 'delayed', 'paused'),
        assignees: Joi.array().items(Joi.string().custom(objectId)),
        dependencies: Joi.array().items(
            Joi.object().keys({
                predecessorId: Joi.string().custom(objectId).required(),
                type: Joi.string().valid('FS', 'SS', 'FF', 'SF'),
                lagDays: Joi.number()
            })
        ),
        notes: Joi.string().allow('', null)
    }).min(1)
};

const deleteWbsItem = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    })
};

module.exports = {
    createWbsItem,
    getProjectWbs,
    getWbsItem,
    updateWbsItem,
    deleteWbsItem
};