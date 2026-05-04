const BOQItem = require('../models/boq.model');
const Project = require('../models/project.model');
const WBSItem = require('../models/wbsItem.model');
const Contract = require('../models/contract.model');
const ApiError = require('../utils/ApiError');

const assertProjectExists = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, 'Không tìm thấy dự án');
    }
    return project;
};

const assertRelatedExists = async (Model, id, message) => {
    if (!id) return null;
    const doc = await Model.findById(id);
    if (!doc) throw new ApiError(404, message);
    return doc;
};

const buildMatch = (projectId, filter) => ({
    projectId,
    ...(filter.wbsItemId ? { wbsItemId: filter.wbsItemId } : {}),
    ...(filter.contractId ? { contractId: filter.contractId } : {}),
});

const listBoq = async (projectId, filter, options) => {
    await assertProjectExists(projectId);
    const match = buildMatch(projectId, filter);
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const [agg] = await BOQItem.aggregate([
        { $match: match },
        {
            $facet: {
                results: [
                    { $sort: { sortOrder: 1, createdAt: 1 } },
                    { $skip: skip },
                    { $limit: limit },
                ],
                meta: [
                    { $group: { _id: null, totalResults: { $sum: 1 }, grandTotal: { $sum: '$totalPrice' } } },
                ],
            },
        },
    ]);

    return {
        results: agg?.results || [],
        totalResults: agg?.meta?.[0]?.totalResults || 0,
        grandTotal: agg?.meta?.[0]?.grandTotal || 0,
    };
};

const createBoq = async (projectId, body) => {
    await assertProjectExists(projectId);
    await assertRelatedExists(WBSItem, body.wbsItemId, 'Không tìm thấy WBS Item');
    await assertRelatedExists(Contract, body.contractId, 'Không tìm thấy hợp đồng');

    const exists = await BOQItem.findOne({ projectId, code: body.code });
    if (exists) throw new ApiError(400, 'Mã BOQ đã tồn tại trong dự án này');

    const item = new BOQItem({ ...body, projectId });
    await item.save();
    return item;
};

const bulkCreateBoq = async (projectId, body) => {
    await assertProjectExists(projectId);

    const payload = body.items.map((item) => ({ ...item, projectId }));
    const codes = payload.filter((x) => x.code).map((x) => x.code);
    if (codes.length) {
        const duplicate = await BOQItem.findOne({ projectId, code: { $in: codes } });
        if (duplicate) throw new ApiError(400, 'Có mã BOQ đã tồn tại trong dự án này');
    }

    const wbsIds = [...new Set(payload.filter((x) => x.wbsItemId).map((x) => x.wbsItemId.toString()))];
    for (const id of wbsIds) await assertRelatedExists(WBSItem, id, 'Không tìm thấy WBS Item');
    const contractIds = [...new Set(payload.filter((x) => x.contractId).map((x) => x.contractId.toString()))];
    for (const id of contractIds) await assertRelatedExists(Contract, id, 'Không tìm thấy hợp đồng');

    const docs = payload.map((item) => {
        const doc = new BOQItem(item);
        doc.totalPrice = doc.plannedQty * doc.unitPrice;
        doc.remainingQty = doc.plannedQty;
        doc.isOverrun = false;
        doc.overrunQty = 0;
        return doc;
    });

    return await BOQItem.insertMany(docs, { ordered: false });
};

const getBoqById = async (id) => {
    const item = await BOQItem.findById(id)
        .populate('wbsItemId', 'name code treeCode')
        .populate('contractId', 'code type status');
    if (!item) throw new ApiError(404, 'Không tìm thấy hạng mục BOQ');
    return item;
};

const updateBoqById = async (id, updateBody) => {
    const item = await BOQItem.findById(id);
    if (!item) throw new ApiError(404, 'Không tìm thấy hạng mục BOQ');
    Object.assign(item, updateBody);
    await item.save();
    return item;
};

const deleteBoqById = async (id) => {
    const item = await BOQItem.findById(id);
    if (!item) throw new ApiError(404, 'Không tìm thấy hạng mục BOQ');
    if (item.acceptedQty > 0) throw new ApiError(400, 'Không thể xóa hạng mục đã được nghiệm thu');
    await item.deleteOne();
    return item;
};

module.exports = {
    listBoq,
    createBoq,
    bulkCreateBoq,
    getBoqById,
    updateBoqById,
    deleteBoqById,
};
