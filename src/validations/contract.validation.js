const Joi = require('joi');
const { objectId } = require('./custom.validation');

const appendixFileSchema = Joi.object().keys({
    name: Joi.string().trim().required(),
    url: Joi.string().uri().required(),
});

const createContract = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        code: Joi.string().trim().required().max(100),
        type: Joi.string().valid('received', 'issued', 'labor', 'design', 'supervision').required(),
        partyAName: Joi.string().trim().required().max(255),
        partyBName: Joi.string().trim().required().max(255),
        partyBTaxCode: Joi.string().trim().allow('', null).max(100),
        value: Joi.number().min(0).required(),
        vatRate: Joi.number().min(0).max(100).default(10),
        currency: Joi.string().trim().default('VND'),
        signedDate: Joi.date(),
        startDate: Joi.date(),
        endDate: Joi.date(),
        paymentTerms: Joi.string().allow('', null).max(5000),
        notes: Joi.string().allow('', null).max(10000),
        partyBPhone: Joi.string().allow('', null).max(30),
        partyBEmail: Joi.string().email().allow('', null),
        files: Joi.array().items(appendixFileSchema),
    }),
};

const getContracts = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        type: Joi.string().valid('received', 'issued', 'labor', 'design', 'supervision'),
        status: Joi.string().valid('draft', 'pending_sign', 'active', 'completed', 'terminated', 'disputed'),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const getContract = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
};

const updateContract = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        code: Joi.string().trim().max(100),
        type: Joi.string().valid('received', 'issued', 'labor', 'design', 'supervision'),
        partyAName: Joi.string().trim().max(255),
        partyBName: Joi.string().trim().max(255),
        partyBTaxCode: Joi.string().trim().allow('', null).max(100),
        partyBPhone: Joi.string().allow('', null).max(30),
        partyBEmail: Joi.string().email().allow('', null),
        value: Joi.number().min(0),
        vatRate: Joi.number().min(0).max(100),
        currency: Joi.string().trim(),
        signedDate: Joi.date(),
        startDate: Joi.date(),
        endDate: Joi.date(),
        paymentTerms: Joi.string().allow('', null).max(5000),
        notes: Joi.string().allow('', null).max(10000),
        status: Joi.string().valid('draft', 'pending_sign', 'active', 'completed', 'terminated', 'disputed'),
        files: Joi.array().items(appendixFileSchema),
    }).min(1),
};

const approveContract = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        action: Joi.string().valid('approve', 'reject').required(),
        note: Joi.string().allow('', null).max(5000),
    }),
};

const deleteContract = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
};

const addAppendix = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        code: Joi.string().trim().required().max(100),
        description: Joi.string().allow('', null).max(10000),
        value: Joi.number().min(0).default(0),
        signedDate: Joi.date(),
        files: Joi.array().items(appendixFileSchema),
    }),
};

const updateAppendix = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
        appendixId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        description: Joi.string().allow('', null).max(10000),
        value: Joi.number().min(0),
        signedDate: Joi.date(),
        files: Joi.array().items(appendixFileSchema),
    }).min(1),
};

const addPayment = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        type: Joi.string().valid('advance', 'progress', 'final', 'penalty').required(),
        amount: Joi.number().min(0).required(),
        dueDate: Joi.date(),
        invoiceNo: Joi.string().trim().allow('', null).max(100),
        note: Joi.string().allow('', null).max(10000),
    }),
};

const updatePayment = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
        paymentId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        status: Joi.string().valid('pending', 'paid', 'overdue'),
        paymentDate: Joi.date(),
        invoiceNo: Joi.string().trim().allow('', null).max(100),
        note: Joi.string().allow('', null).max(10000),
    }).min(1),
};

module.exports = {
    createContract,
    getContracts,
    getContract,
    updateContract,
    approveContract,
    deleteContract,
    addAppendix,
    updateAppendix,
    addPayment,
    updatePayment,
};
