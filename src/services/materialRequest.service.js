const mongoose = require('mongoose');
const MaterialRequest = require('../models/materialRequest.model');
const Material = require('../models/material.model');
const InventoryStock = require('../models/inventory.model');
const Project = require('../models/project.model');
const ApiError = require('../utils/ApiError');

const list = async (projectId, filter, options) => {
    await Project.findById(projectId).orFail(new ApiError(404, 'Không tìm thấy dự án'));
    const query = { projectId };
    if (filter.status) query.status = filter.status;
    if (filter.search) query.$or = [{ code: new RegExp(filter.search, 'i') }, { note: new RegExp(filter.search, 'i') }];
    const page = Number(options.page) || 1; const limit = Number(options.limit) || 10; const skip = (page - 1) * limit;
    const [results, totalResults] = await Promise.all([
        MaterialRequest.find(query).populate('requestedBy', 'firstName lastName name').sort({ createdAt: -1 }).skip(skip).limit(limit),
        MaterialRequest.countDocuments(query),
    ]);
    return { results, totalResults };
};

const create = async (projectId, body, userId) => {
    await Project.findById(projectId).orFail(new ApiError(404, 'Không tìm thấy dự án'));
    const materials = await Material.find({ _id: { $in: body.items.map(i => i.materialId) } });
    const materialMap = new Map(materials.map(m => [m.id, m]));
    const code = `MR-${Date.now()}`;
    const items = body.items.map(i => ({ ...i, materialName: materialMap.get(i.materialId)?.name, unit: materialMap.get(i.materialId)?.unit, pendingQty: i.requestedQty, approvedQty: 0, fulfilledQty: 0 }));
    const doc = new MaterialRequest({ ...body, projectId, code, items, requestedBy: userId, status: 'draft' });
    return await doc.save();
};

const getById = async (id) => {
    const doc = await MaterialRequest.findById(id).populate('requestedBy', 'firstName lastName name').populate('approvedBy', 'firstName lastName name');
    if (!doc) throw new ApiError(404, 'Không tìm thấy phiếu PR');
    const materials = await InventoryStock.find({ projectId: doc.projectId, materialId: { $in: doc.items.map(i => i.materialId) } }).select('materialId qtyAvailable');
    const stockMap = new Map(materials.map(s => [s.materialId.toString(), s.qtyAvailable]));
    const data = doc.toObject();
    data.items = data.items.map(i => ({ ...i, stockQty: stockMap.get(i.materialId.toString()) || 0 }));
    return data;
};

const update = async (id, body) => {
    const doc = await MaterialRequest.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy phiếu PR');
    if (doc.status !== 'draft') throw new ApiError(403, 'Chỉ được cập nhật phiếu PR ở trạng thái draft');
    Object.assign(doc, body);
    return await doc.save();
};

const approve = async (id, body, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const doc = await MaterialRequest.findById(id).session(session);
        if (!doc) throw new ApiError(404, 'Không tìm thấy phiếu PR');
        if (body.action === 'reject') { doc.status = 'rejected'; doc.rejectionNote = body.rejectionNote; await doc.save({ session }); await session.commitTransaction(); return doc; }
        const qtyMap = new Map((body.approvedQty || []).map(x => [x.materialId.toString(), x.qty]));
        doc.status = 'approved'; doc.approvedBy = userId; doc.approvedAt = new Date();
        doc.items = doc.items.map(item => ({ ...item.toObject?.() || item, approvedQty: qtyMap.get(item.materialId.toString()) || 0, pendingQty: qtyMap.get(item.materialId.toString()) || 0 }));
        await doc.save({ session });
        for (const item of doc.items) {
            await InventoryStock.updateOne({ projectId: doc.projectId, materialId: item.materialId }, { $inc: { qtyReserved: item.approvedQty || 0 }, $setOnInsert: { qtyOnHand: 0 } }, { upsert: true, session });
        }
        await session.commitTransaction();
        return doc;
    } catch (e) { await session.abortTransaction(); throw e; } finally { session.endSession(); }
};

module.exports = { list, create, getById, update, approve };
