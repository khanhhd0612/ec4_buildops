const Joi = require('joi');
const { objectId } = require('./custom.validation');

const baseBody = {
    code: Joi.string().trim().uppercase().max(100),
    name: Joi.string().trim().max(255),
    type: Joi.string().valid('vehicle', 'machinery', 'tool', 'scaffold', 'other'),
    plateNo: Joi.string().allow('', null).max(50),
    brand: Joi.string().allow('', null).max(100),
    model: Joi.string().allow('', null).max(100),
    yearMade: Joi.number().integer().min(1900).max(2100),
    purchaseDate: Joi.date(),
    purchasePrice: Joi.number().min(0),
    imageUrl: Joi.string().uri().allow('', null),
    notes: Joi.string().allow('', null).max(5000),
    status: Joi.string().valid('available', 'in_use', 'maintenance', 'retired'),
    currentProjectId: Joi.string().custom(objectId).allow('', null),
};

const getEquipment = {
    query: Joi.object().keys({
        type: Joi.string().valid('vehicle', 'machinery', 'tool', 'scaffold', 'other'),
        status: Joi.string().valid('available', 'in_use', 'maintenance', 'retired'),
        search: Joi.string().allow('', null),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const createEquipment = {
    body: Joi.object().keys({
        ...baseBody,
        code: Joi.string().trim().uppercase().required().max(100),
        name: Joi.string().trim().required().max(255),
    }),
};

const getById = { params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }) };

const updateEquipment = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        name: baseBody.name,
        plateNo: baseBody.plateNo,
        status: baseBody.status,
        currentProjectId: baseBody.currentProjectId,
        notes: baseBody.notes,
    }).min(1),
};

const deleteEquipment = getById;

const assignEquipment = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
        wbsItemId: Joi.string().custom(objectId),
        note: Joi.string().allow('', null).max(5000),
    }),
};

const createLog = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
        wbsItemId: Joi.string().custom(objectId),
        logDate: Joi.date().required(),
        hoursUsed: Joi.number().min(0).default(0),
        fuelUsed: Joi.number().min(0),
        operatorId: Joi.string().custom(objectId),
        note: Joi.string().allow('', null).max(5000),
    }),
};

const listLogs = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    query: Joi.object().keys({
        projectId: Joi.string().custom(objectId),
        dateFrom: Joi.date(),
        dateTo: Joi.date(),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

module.exports = {
    getEquipment,
    createEquipment,
    getById,
    updateEquipment,
    deleteEquipment,
    assignEquipment,
    createLog,
    listLogs,
};
