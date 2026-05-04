const Joi = require('joi');
const { objectId } = require('./custom.validation');

const itemSchema = Joi.object().keys({
    materialId: Joi.string().custom(objectId).required(),
    requestedQty: Joi.number().min(0).required(),
    note: Joi.string().allow('', null).max(2000),
});

const list = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        status: Joi.string(),
        search: Joi.string().allow('', null),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const create = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        wbsItemId: Joi.string().custom(objectId),
        neededDate: Joi.date(),
        note: Joi.string().allow('', null).max(5000),
        items: Joi.array().items(itemSchema).min(1).required(),
    }),
};

const get = { params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }) };

const update = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        wbsItemId: Joi.string().custom(objectId),
        neededDate: Joi.date(),
        note: Joi.string().allow('', null).max(5000),
        items: Joi.array().items(itemSchema).min(1),
    }).min(1),
};

const approve = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        action: Joi.string().valid('approve', 'reject').required(),
        approvedQty: Joi.array().items(Joi.object().keys({ materialId: Joi.string().custom(objectId).required(), qty: Joi.number().min(0).required() })),
        rejectionNote: Joi.string().allow('', null).max(5000),
    }),
};

module.exports = { list, create, get, update, approve };
