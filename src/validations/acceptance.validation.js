const Joi = require('joi');
const { objectId } = require('./custom.validation');

const fileSchema = Joi.object().keys({
    name: Joi.string().trim().required(),
    url: Joi.string().uri().required(),
});

const itemSchema = Joi.object().keys({
    boqItemId: Joi.string().custom(objectId).required(),
    boqName: Joi.string().trim().required().max(255),
    unit: Joi.string().trim().required().max(50),
    prevQty: Joi.number().min(0).default(0),
    currentQty: Joi.number().min(0).required(),
    unitPrice: Joi.number().min(0).required(),
});

const listAcceptance = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        contractId: Joi.string().custom(objectId),
        status: Joi.string().valid('draft', 'submitted', 'approved', 'finalized', 'rejected'),
        type: Joi.string().valid('partial', 'final'),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const createAcceptance = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        contractId: Joi.string().custom(objectId).required(),
        wbsItemId: Joi.string().custom(objectId),
        code: Joi.string().trim().required().max(100),
        type: Joi.string().valid('partial', 'final').default('partial'),
        periodStart: Joi.date().required(),
        periodEnd: Joi.date().greater(Joi.ref('periodStart')).required().messages({
            'date.greater': 'periodEnd phải lớn hơn periodStart',
        }),
        items: Joi.array().items(itemSchema).min(1).required(),
        note: Joi.string().allow('', null).max(10000),
        files: Joi.array().items(fileSchema),
    }),
};

const getAcceptance = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
};

const updateAcceptance = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        periodStart: Joi.date(),
        periodEnd: Joi.date(),
        items: Joi.array().items(itemSchema).min(1),
        note: Joi.string().allow('', null).max(10000),
        files: Joi.array().items(fileSchema),
    }).min(1),
};

const approveAcceptance = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        action: Joi.string().valid('submit', 'approve', 'finalize', 'reject').required(),
        rejectionNote: Joi.string().allow('', null).max(5000),
    }),
};

module.exports = {
    listAcceptance,
    createAcceptance,
    getAcceptance,
    updateAcceptance,
    approveAcceptance,
};
