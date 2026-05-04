const Joi = require('joi');
const { objectId, projectCode } = require('./custom.validation');

const locationSchema = Joi.object().keys({
    address: Joi.string().allow('', null),
    province: Joi.string().allow('', null),
    district: Joi.string().allow('', null),
    ward: Joi.string().allow('', null),
    coordinates: Joi.object().keys({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180),
    }),
});

const memberSchema = Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    role: Joi.string()
        .valid('owner', 'pm', 'engineer', 'supervisor', 'warehouse', 'viewer')
        .default('viewer'),
});

const createProject = {
    body: Joi.object().keys({
        // Bắt buộc
        code: Joi.string().required().custom(projectCode),
        name: Joi.string().required().trim().min(3).max(200),

        type: Joi.string()
            .valid('construction', 'mep', 'interior', 'infrastructure', 'industrial'),
        status: Joi.string()
            .valid('planning', 'in_progress', 'paused', 'completed', 'closed')
            .default('planning'),

        ownerUnit: Joi.string().allow('', null),
        mainContractor: Joi.string().allow('', null),
        consultantUnit: Joi.string().allow('', null),

        location: locationSchema,

        startDate: Joi.date(),
        endDate: Joi.date().greater(Joi.ref('startDate')).messages({
            'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu',
        }),

        totalBudget: Joi.number().min(0),
        contractValue: Joi.number().min(0),
        currency: Joi.string().valid('VND', 'USD', 'EUR').default('VND'),

        area: Joi.number().min(0),
        floors: Joi.number().integer().min(0),
        riskLevel: Joi.string().valid('low', 'medium', 'high'),

        tags: Joi.array().items(Joi.string().trim()).max(10),
        description: Joi.string().allow('', null).max(2000),
        coverImageUrl: Joi.string().uri().allow('', null),

        members: Joi.array().items(memberSchema),
    }),
};

const getProjects = {
    query: Joi.object().keys({
        status: Joi.string(),
        type: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    })
};

const getProject = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    })
};

const updateProject = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().trim().min(3).max(200),
            type: Joi.string().valid('construction', 'mep', 'interior', 'infrastructure', 'industrial'),
            status: Joi.string().valid('planning', 'in_progress', 'paused', 'completed', 'closed'),
            ownerUnit: Joi.string().allow('', null),
            mainContractor: Joi.string().allow('', null),
            consultantUnit: Joi.string().allow('', null),
            location: locationSchema,
            startDate: Joi.date(),
            endDate: Joi.date().greater(Joi.ref('startDate')),
            totalBudget: Joi.number().min(0),
            contractValue: Joi.number().min(0),
            currency: Joi.string().valid('VND', 'USD', 'EUR'),
            area: Joi.number().min(0),
            floors: Joi.number().integer().min(0),
            riskLevel: Joi.string().valid('low', 'medium', 'high'),
            tags: Joi.array().items(Joi.string().trim()).max(10),
            description: Joi.string().allow('', null).max(2000),
            coverImageUrl: Joi.string().uri().allow('', null),
        })
        .min(1),
};

const addMember = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        userId: Joi.string().custom(objectId).required(),
        role: Joi.string().valid('owner', 'pm', 'engineer', 'supervisor', 'warehouse', 'viewer').default('viewer')
    })
};

const removeMember = {
    params: Joi.object().keys({
        projectId: Joi.string().custom(objectId).required(),
        userId: Joi.string().custom(objectId).required(),
    })
};

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    addMember,
    removeMember
};