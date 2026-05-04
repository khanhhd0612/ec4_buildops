const Joi = require('joi');
const { objectId } = require('./custom.validation');

const workItemSchema = Joi.object().keys({
    wbsItemId: Joi.string().custom(objectId),
    description: Joi.string().required().max(5000),
    location: Joi.string().allow('', null).max(500),
    qty: Joi.number().min(0),
    unit: Joi.string().allow('', null).max(50),
    completionPct: Joi.number().min(0).max(100),
});

const laborEntrySchema = Joi.object().keys({
    laborType: Joi.string().allow('', null).max(255),
    headcount: Joi.number().min(0),
    hoursWorked: Joi.number().min(0),
    note: Joi.string().allow('', null).max(5000),
});

const equipmentEntrySchema = Joi.object().keys({
    equipmentId: Joi.string().custom(objectId),
    equipmentName: Joi.string().allow('', null).max(255),
    hoursUsed: Joi.number().min(0),
    note: Joi.string().allow('', null).max(5000),
});

const photoSchema = Joi.object().keys({
    url: Joi.string().uri().required(),
    publicId: Joi.string().allow('', null),
    caption: Joi.string().allow('', null).max(1000),
    takenAt: Joi.date(),
});

const baseBody = {
    diaryDate: Joi.date(),
    weather: Joi.string().valid('sunny', 'cloudy', 'rainy', 'storm', 'foggy'),
    temperature: Joi.number(),
    workingHours: Joi.number().min(0),
    canWork: Joi.boolean(),
    totalHeadcount: Joi.number().min(0),
    notes: Joi.string().allow('', null).max(10000),
    issues: Joi.string().allow('', null).max(10000),
    workItems: Joi.array().items(workItemSchema),
    laborEntries: Joi.array().items(laborEntrySchema),
    equipmentEntries: Joi.array().items(equipmentEntrySchema),
    photos: Joi.array().items(photoSchema),
};

const listSiteDiaries = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    query: Joi.object().keys({
        dateFrom: Joi.date(),
        dateTo: Joi.date(),
        createdBy: Joi.string().custom(objectId),
        status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected'),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const createSiteDiary = {
    params: Joi.object().keys({ projectId: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        diaryDate: Joi.date().required(),
        weather: baseBody.weather,
        temperature: baseBody.temperature,
        workingHours: baseBody.workingHours,
        canWork: baseBody.canWork,
        totalHeadcount: baseBody.totalHeadcount,
        notes: baseBody.notes,
        issues: baseBody.issues,
        workItems: baseBody.workItems,
        laborEntries: baseBody.laborEntries,
        equipmentEntries: baseBody.equipmentEntries,
        photos: baseBody.photos,
    }),
};

const getSiteDiary = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
};

const updateSiteDiary = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys(baseBody).min(1),
};

const approveSiteDiary = {
    params: Joi.object().keys({ id: Joi.string().custom(objectId).required() }),
    body: Joi.object().keys({
        action: Joi.string().valid('submit', 'approve', 'reject').required(),
        rejectionNote: Joi.string().allow('', null).max(5000),
    }),
};

module.exports = {
    listSiteDiaries,
    createSiteDiary,
    getSiteDiary,
    updateSiteDiary,
    approveSiteDiary,
};
