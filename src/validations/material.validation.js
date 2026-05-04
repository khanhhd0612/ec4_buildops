const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMaterial = {
    body: Joi.object().keys({
        code: Joi.string().trim().required().max(100),
        name: Joi.string().trim().required().max(255),
        unit: Joi.string().trim().required().max(50),
        category: Joi.string().trim().allow('', null).max(255),
        spec: Joi.string().allow('', null).max(5000),
        brand: Joi.string().allow('', null).max(255),
        imageUrl: Joi.string().uri().allow('', null),
        referencePrice: Joi.number().min(0),
        isActive: Joi.boolean(),
    }),
};

const getMaterials = {
    query: Joi.object().keys({
        category: Joi.string().allow('', null),
        isActive: Joi.boolean(),
        search: Joi.string().allow('', null),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const updateMaterial = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        code: Joi.string().trim().max(100),
        name: Joi.string().trim().max(255),
        unit: Joi.string().trim().max(50),
        category: Joi.string().trim().allow('', null).max(255),
        spec: Joi.string().allow('', null).max(5000),
        brand: Joi.string().allow('', null).max(255),
        imageUrl: Joi.string().uri().allow('', null),
        referencePrice: Joi.number().min(0),
        isActive: Joi.boolean(),
    }).min(1),
};

const deleteMaterial = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
};

module.exports = { 
    createMaterial, 
    getMaterials, 
    updateMaterial, 
    deleteMaterial 
};
