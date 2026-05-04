const Joi = require('joi');
const { objectId } = require('./custom.validation');

const period = Joi.string().pattern(/^\d{4}-\d{2}$/).message('period phải có định dạng YYYY-MM');

const listCosts = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    query: Joi.object().keys({
        period: period,
        category: Joi.string().valid('labor', 'material', 'equipment', 'transport', 'subcontract', 'overhead', 'other'),
        wbsItemId: Joi.string().custom(objectId),
    }),
};

const createCost = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        wbsItemId: Joi.string().custom(objectId),
        period: period.required(),
        category: Joi.string().valid('labor', 'material', 'equipment', 'transport', 'subcontract', 'overhead', 'other').required(),
        plannedCost: Joi.number().min(0).required(),
    }),
};

const updateCost = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        plannedCost: Joi.number().min(0),
        forecastCost: Joi.number().min(0),
    }).min(1),
};

const approveCost = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        action: Joi.string().valid('approve', 'reject').required(),
    }),
};

const listExpenses = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    query: Joi.object().keys({
        category: Joi.string().valid('labor', 'material', 'equipment', 'transport', 'overhead', 'other'),
        status: Joi.string().valid('draft', 'pending', 'approved', 'rejected', 'paid'),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const createExpense = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        wbsItemId: Joi.string().custom(objectId),
        title: Joi.string().trim().required().max(255),
        category: Joi.string().valid('labor', 'material', 'equipment', 'transport', 'overhead', 'other').required(),
        amount: Joi.number().min(0).required(),
        expenseDate: Joi.date(),
        vendor: Joi.string().allow('', null).max(255),
        invoiceNo: Joi.string().allow('', null).max(100),
        invoiceDate: Joi.date(),
        description: Joi.string().allow('', null).max(5000),
        files: Joi.array().items(Joi.object().keys({ name: Joi.string().required(), url: Joi.string().uri().required() })),
    }),
};

const getExpense = { params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }) };

const updateExpense = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        wbsItemId: Joi.string().custom(objectId),
        title: Joi.string().trim().max(255),
        category: Joi.string().valid('labor', 'material', 'equipment', 'transport', 'overhead', 'other'),
        amount: Joi.number().min(0),
        expenseDate: Joi.date(),
        vendor: Joi.string().allow('', null).max(255),
        invoiceNo: Joi.string().allow('', null).max(100),
        invoiceDate: Joi.date(),
        description: Joi.string().allow('', null).max(5000),
        files: Joi.array().items(Joi.object().keys({ name: Joi.string().required(), url: Joi.string().uri().required() })),
    }).min(1),
};

const approveExpense = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        action: Joi.string().valid('approve', 'reject', 'mark_paid').required(),
        rejectionNote: Joi.string().allow('', null).max(5000),
    }),
};

module.exports = { listCosts, createCost, updateCost, approveCost, listExpenses, createExpense, getExpense, updateExpense, approveExpense };
