const Joi = require('joi');
const { objectId } = require('./custom.validation');

const folderBase = {
    name: Joi.string().trim().required().max(255),
    parentId: Joi.string().custom(objectId).allow('', null),
    sortOrder: Joi.number().integer().min(0),
};

const fileBase = {
    folderId: Joi.string().custom(objectId).allow('', null),
    name: Joi.string().trim().required().max(255),
    fileUrl: Joi.string().uri().required(),
    publicId: Joi.string().allow('', null),
    fileSize: Joi.number().min(0),
    mimeType: Joi.string().allow('', null).max(255),
    category: Joi.string().valid('drawing', 'contract', 'permit', 'report', 'photo', 'spec', 'other'),
    tags: Joi.array().items(Joi.string().trim()).default([]),
};

const listFolders = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    query: Joi.object().keys({ parentId: Joi.string().custom(objectId).allow('', null) }),
};

const createFolder = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys(folderBase),
};

const updateFolder = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys(folderBase).min(1),
};

const deleteFolder = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
};

const listDocuments = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    query: Joi.object().keys({
        folderId: Joi.string().custom(objectId).allow('', null),
        category: Joi.string().valid('drawing', 'contract', 'permit', 'report', 'photo', 'spec', 'other'),
        tags: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
        search: Joi.string().allow('', null),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const createDocument = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys(fileBase),
};

const updateDocument = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        name: Joi.string().trim().max(255),
        folderId: Joi.string().custom(objectId).allow('', null),
        category: Joi.string().valid('drawing', 'contract', 'permit', 'report', 'photo', 'spec', 'other'),
        tags: Joi.array().items(Joi.string().trim()),
    }).min(1),
};

const deleteDocument = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
};

module.exports = {
    listFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    listDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
};
