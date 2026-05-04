const mongoose = require('mongoose');
const InventoryStock = require('../models/inventory.model');
const InventoryTransaction = require('../models/inventoryTransaction.model');
const MaterialRequest = require('../models/materialRequest.model');
const Material = require('../models/material.model');
const Project = require('../models/project.model');
const ApiError = require('../utils/ApiError');

const listStocks = async (projectId, filter, options) => {
    await Project.findById(projectId).orFail(new ApiError(404, 'Không tìm thấy dự án'));
    const query = { projectId, ...(filter.materialId ? { materialId: filter.materialId } : {}) };
    const page = Number(options.page) || 1, limit = Number(options.limit) || 10, skip = (page - 1) * limit;
    const [results, totalResults] = await Promise.all([
        InventoryStock.find(query).populate('materialId', 'code name unit category').skip(skip).limit(limit),
        InventoryStock.countDocuments(query),
    ]);
    return { results, totalResults };
};

const createTransaction = async (projectId, body, userId) => {
    const session = await mongoose.startSession(); session.startTransaction();
    try {
        await Project.findById(projectId).session(session).orFail(new ApiError(404, 'Không tìm thấy dự án'));
        const materials = await Material.find({ _id: { $in: body.items.map(i => i.materialId) } }).session(session);
        const map = new Map(materials.map(m => [m.id, m]));
        const tx = new InventoryTransaction({ ...body, projectId, transactedBy: userId, items: body.items.map(i => ({ ...i, materialName: map.get(i.materialId)?.name, unit: map.get(i.materialId)?.unit })) });
        await tx.save({ session });
        for (const item of tx.items) {
            const inc = body.type === 'import' ? item.qty : body.type === 'export' ? -item.qty : 0;
            const stock = await InventoryStock.findOneAndUpdate({ projectId, materialId: item.materialId }, { $inc: { qtyOnHand: inc }, $setOnInsert: { qtyReserved: 0 } }, { new: true, upsert: true, session });
            stock.lastUpdatedBy = userId; stock.lastUpdatedAt = new Date(); await stock.save({ session });
        }
        if (body.type === 'export' && body.refType === 'material_request' && body.refId) {
            const req = await MaterialRequest.findById(body.refId).session(session);
            if (req) {
                const qtyMap = new Map(tx.items.map(i => [i.materialId.toString(), i.qty]));
                req.items = req.items.map(it => { const q = qtyMap.get(it.materialId.toString()) || 0; return { ...it.toObject?.() || it, fulfilledQty: (it.fulfilledQty || 0) + q, pendingQty: Math.max(0, (it.pendingQty || 0) - q) }; });
                req.status = req.items.every(i => i.pendingQty === 0) ? 'fulfilled' : 'partial';
                await req.save({ session });
                for (const item of tx.items) {
                    await InventoryStock.updateOne({ projectId, materialId: item.materialId }, { $inc: { qtyReserved: -item.qty } }, { session });
                }
            }
        }
        await session.commitTransaction(); return tx;
    } catch (e) { await session.abortTransaction(); throw e; } finally { session.endSession(); }
};

const listTransactions = async (projectId, filter, options) => {
    const query = { projectId, ...(filter.type ? { type: filter.type } : {}), ...(filter.materialId ? { 'items.materialId': filter.materialId } : {}) };
    if (filter.fromDate || filter.toDate) query.transactionDate = { ...(filter.fromDate ? { $gte: filter.fromDate } : {}), ...(filter.toDate ? { $lte: filter.toDate } : {}) };
    const page = Number(options.page) || 1, limit = Number(options.limit) || 10, skip = (page - 1) * limit;
    const [results, totalResults] = await Promise.all([
        InventoryTransaction.find(query).sort({ transactionDate: -1 }).skip(skip).limit(limit).populate('transactedBy', 'name firstName lastName'),
        InventoryTransaction.countDocuments(query),
    ]);
    return { results, totalResults };
};

module.exports = { listStocks, createTransaction, listTransactions };
