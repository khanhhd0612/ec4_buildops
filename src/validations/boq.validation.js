const Joi = require('joi');
const { objectId } = require('./custom.validation');

const boqItemSchema = Joi.object().keys({
    wbsItemId: Joi.string().custom(objectId).allow('', null),
    contractId: Joi.string().custom(objectId).allow('', null),
    code: Joi.string().trim().allow('', null).max(100),
    name: Joi.string().trim().required().max(255),
    unit: Joi.string().trim().required().max(50),
    plannedQty: Joi.number().min(0).required(),
    unitPrice: Joi.number().min(0).required(),
    description: Joi.string().allow('', null).max(5000),
    sortOrder: Joi.number().integer().min(0),
});

const listBoq = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        wbsItemId: Joi.string().custom(objectId),
        contractId: Joi.string().custom(objectId),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const createBoq = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    body: boqItemSchema,
};

const bulkCreateBoq = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        items: Joi.array().items(boqItemSchema).min(1).required(),
    }),
};

const updateBoq = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        name: Joi.string().trim().max(255),
        unit: Joi.string().trim().max(50),
        plannedQty: Joi.number().min(0),
        unitPrice: Joi.number().min(0),
        description: Joi.string().allow('', null).max(5000),
    }).min(1),
};

const deleteBoq = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    listBoq,
    createBoq,
    bulkCreateBoq,
    updateBoq,
    deleteBoq,
};
