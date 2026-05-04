const mongoose = require('mongoose');
const ExpenseRequest = require('../models/expenseRequest.model');
const CostSummary = require('../models/costSumary.model');
const Project = require('../models/project.model');
const WBSItem = require('../models/wbsItem.model');
const ApiError = require('../utils/ApiError');

const generateCode = async (projectId) => {
    const count = await ExpenseRequest.countDocuments({ projectId });
    return `EXP-${String(count + 1).padStart(5, '0')}`;
};

const list = async (projectId, filter, options) => {
    await Project.findById(projectId).orFail(new ApiError(404, 'Không tìm thấy dự án'));
    const query = { projectId };
    if (filter.category) query.category = filter.category;
    if (filter.status) query.status = filter.status;
    const page = Number(options.page) || 1; const limit = Number(options.limit) || 10; const skip = (page - 1) * limit;
    const [results, totalResults] = await Promise.all([
        ExpenseRequest.find(query).populate('requestedBy', 'name firstName lastName').sort({ createdAt: -1 }).skip(skip).limit(limit),
        ExpenseRequest.countDocuments(query),
    ]);
    return { results, totalResults };
};

const create = async (projectId, body, userId) => {
    await Project.findById(projectId).orFail(new ApiError(404, 'Không tìm thấy dự án'));
    if (body.wbsItemId) await WBSItem.findById(body.wbsItemId).orFail(new ApiError(404, 'Không tìm thấy WBS item'));
    const doc = new ExpenseRequest({ ...body, projectId, code: await generateCode(projectId), requestedBy: userId, status: 'draft' });
    return await doc.save();
};

const getById = async (id) => {
    const doc = await ExpenseRequest.findById(id).populate('requestedBy', 'name firstName lastName').populate('approvedBy', 'name firstName lastName');
    if (!doc) throw new ApiError(404, 'Không tìm thấy phiếu đề xuất');
    return doc;
};

const update = async (id, body) => {
    const doc = await ExpenseRequest.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy phiếu đề xuất');
    if (doc.status !== 'draft') throw new ApiError(403, 'Chỉ được cập nhật phiếu ở trạng thái draft');
    Object.assign(doc, body);
    return await doc.save();
};

const approve = async (id, body, userId) => {
    const session = await mongoose.startSession(); session.startTransaction();
    try {
        const doc = await ExpenseRequest.findById(id).session(session);
        if (!doc) throw new ApiError(404, 'Không tìm thấy phiếu đề xuất');
        if (body.action === 'reject') {
            doc.status = 'rejected';
            doc.rejectionNote = body.rejectionNote;
            await doc.save({ session });
            await session.commitTransaction();
            return doc;
        }
        if (body.action === 'approve') {
            doc.status = 'approved';
            doc.approvedBy = userId;
            doc.approvedAt = new Date();
            await doc.save({ session });
            await session.commitTransaction();
            return doc;
        }
        doc.status = 'paid';
        doc.paidAt = new Date();
        await doc.save({ session });
        const paidPeriod = doc.paidAt.toISOString().slice(0, 7);
        await CostSummary.findOneAndUpdate(
            { projectId: doc.projectId, category: doc.category, period: paidPeriod },
            { $inc: { actualCost: doc.amount }, $setOnInsert: { wbsItemId: doc.wbsItemId, plannedCost: 0, committedCost: 0, forecastCost: 0, status: 'draft' } },
            { upsert: true, new: true, session, setDefaultsOnInsert: true }
        );
        await session.commitTransaction();
        return doc;
    } catch (e) { await session.abortTransaction(); throw e; } finally { session.endSession(); }
};

module.exports = { list, create, getById, update, approve };
