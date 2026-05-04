const SiteDiary = require('../models/siteDiary.model');
const Project = require('../models/project.model');
const ApiError = require('../utils/ApiError');

const assertProject = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Không tìm thấy dự án');
    return project;
};

const listSiteDiaries = async (projectId, filter, options) => {
    await assertProject(projectId);
    const query = { projectId };
    if (filter.createdBy) query.createdBy = filter.createdBy;
    if (filter.status) query.status = filter.status;
    if (filter.dateFrom || filter.dateTo) query.diaryDate = { ...(filter.dateFrom ? { $gte: filter.dateFrom } : {}), ...(filter.dateTo ? { $lte: filter.dateTo } : {}) };
    const page = Number(options.page) || 1; const limit = Number(options.limit) || 10; const skip = (page - 1) * limit;
    const [results, totalResults] = await Promise.all([
        SiteDiary.find(query).select('-photos').populate('createdBy', 'firstName lastName').sort({ diaryDate: -1 }).skip(skip).limit(limit).lean(),
        SiteDiary.countDocuments(query),
    ]);
    const withCounts = results.map((d) => ({ ...d, photosCount: Array.isArray(d.photos) ? d.photos.length : 0 }));
    return { results: withCounts, totalResults };
};

const createSiteDiary = async (projectId, body, userId) => {
    await assertProject(projectId);
    try {
        return await SiteDiary.create({ ...body, projectId, createdBy: userId, status: 'draft' });
    } catch (e) {
        if (e?.code === 11000) throw new ApiError(400, 'Bạn đã tạo nhật ký cho ngày này rồi');
        throw e;
    }
};

const getSiteDiary = async (id) => {
    const doc = await SiteDiary.findById(id).populate('createdBy', 'firstName lastName name').populate('approvedBy', 'firstName lastName name');
    if (!doc) throw new ApiError(404, 'Không tìm thấy nhật ký');
    return doc;
};

const updateSiteDiary = async (id, body) => {
    const doc = await SiteDiary.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy nhật ký');
    if (doc.status !== 'draft') throw new ApiError(403, 'Chỉ được cập nhật nhật ký ở trạng thái draft');
    Object.assign(doc, body);
    return await doc.save();
};

const approveSiteDiary = async (id, body, userId) => {
    const doc = await SiteDiary.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy nhật ký');
    if (body.action === 'submit') {
        if (doc.status !== 'draft') throw new ApiError(400, 'Chỉ có thể submit từ trạng thái draft');
        doc.status = 'submitted';
        return await doc.save();
    }
    if (body.action === 'approve') {
        if (doc.status !== 'submitted') throw new ApiError(400, 'Chỉ có thể approve từ trạng thái submitted');
        doc.status = 'approved';
        doc.approvedBy = userId;
        doc.approvedAt = new Date();
        return await doc.save();
    }
    doc.status = 'rejected';
    doc.rejectionNote = body.rejectionNote;
    return await doc.save();
};

module.exports = { listSiteDiaries, createSiteDiary, getSiteDiary, updateSiteDiary, approveSiteDiary };
