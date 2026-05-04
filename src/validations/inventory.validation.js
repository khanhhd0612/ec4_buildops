const Joi = require('joi');
const { objectId } = require('./custom.validation');

const list = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required()
    }),
    query: Joi.object().keys({
        materialId: Joi.string().custom(objectId),
        category: Joi.string(),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100)
    })
};

const createTxn = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required()
    }),
    body: Joi.object().keys({
        type: Joi.string().valid('import', 'export', 'transfer', 'adjust', 'return').required(),
        code: Joi.string().trim().required(),
        transactionDate: Joi.date(),
        refType: Joi.string().valid('material_request', 'purchase_order', 'return', 'manual'),
        refId: Joi.string().custom(objectId),
        note: Joi.string().allow('', null),
        items: Joi.array().items(Joi.object().keys({
            materialId: Joi.string().custom(objectId).required(),
            qty: Joi.number().min(0).required(),
            unitPrice: Joi.number().min(0),
            lotNo: Joi.string().allow('', null),
            note: Joi.string().allow('', null)
        })).min(1).required()
    })
};

const listTxn = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required()
    }),
    query: Joi.object().keys({
        type: Joi.string().valid('import', 'export', 'transfer', 'adjust', 'return'),
        materialId: Joi.string().custom(objectId),
        fromDate: Joi.date(),
        toDate: Joi.date(),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100)
    })
};

module.exports = { list, createTxn, listTxn };
