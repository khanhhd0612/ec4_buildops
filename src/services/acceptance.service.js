const mongoose = require('mongoose');
const AcceptanceRecord = require('../models/acceptance.model');
const BOQItem = require('../models/boq.model');
const Contract = require('../models/contract.model');
const ApiError = require('../utils/ApiError');

const listAcceptance = async (projectId, filter, options) => {
    const query = { projectId, ...filter };
    const limit = options.limit ? Number(options.limit) : 10;
    const page = options.page ? Number(options.page) : 1;
    const skip = (page - 1) * limit;

    const [results, totalResults] = await Promise.all([
        AcceptanceRecord.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('submittedBy', 'name')
            .populate('approvedBy', 'name')
            .populate('finalizedBy', 'name'),
        AcceptanceRecord.countDocuments(query),
    ]);

    return {
        results,
        totalResults,
        page,
        limit
    };
};

const createAcceptance = async (projectId, body, userId) => {
    const contract = await Contract.findOne({ _id: body.contractId, projectId });
    if (!contract) throw new ApiError(404, 'Không tìm thấy hợp đồng thuộc dự án này');

    const record = new AcceptanceRecord({
        ...body,
        projectId,
        createdBy: userId,
    });

    await record.save();
    return record;
};

const getAcceptanceById = async (id) => {
    const record = await AcceptanceRecord.findById(id)
        .populate('submittedBy', 'name')
        .populate('approvedBy', 'name')
        .populate('finalizedBy', 'name')
        .populate('items.boqItemId');

    if (!record) throw new ApiError(404, 'Không tìm thấy biên bản nghiệm thu');
    return record;
};

const updateAcceptance = async (id, updateBody) => {
    const record = await AcceptanceRecord.findById(id);
    if (!record) throw new ApiError(404, 'Không tìm thấy biên bản nghiệm thu');
    if (record.status !== 'draft') throw new ApiError(403, 'Chỉ được cập nhật biên bản ở trạng thái draft');

    Object.assign(record, updateBody);
    await record.save();
    return record;
};

const approveAcceptance = async (id, action, note, userId) => {
    const record = await AcceptanceRecord.findById(id);
    if (!record) throw new ApiError(404, 'Không tìm thấy biên bản nghiệm thu');

    if (action === 'submit') {
        if (record.status !== 'draft') throw new ApiError(400, 'Chỉ có thể submit từ trạng thái draft');
        record.status = 'submitted';
        record.submittedBy = userId;
        record.submittedAt = new Date();
        await record.save();
        return record;
    }

    if (action === 'approve') {
        if (record.status !== 'submitted') throw new ApiError(400, 'Chỉ có thể approve từ trạng thái submitted');
        record.status = 'approved';
        record.approvedBy = userId;
        record.approvedAt = new Date();
        await record.save();
        return record;
    }

    if (action === 'reject') {
        record.status = 'rejected';
        record.rejectionNote = note || record.rejectionNote;
        await record.save();
        return record;
    }

    if (action === 'finalize') {
        if (record.status !== 'approved') throw new ApiError(400, 'Chỉ có thể finalize từ trạng thái approved');

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            record.status = 'finalized';
            record.finalizedBy = userId;
            record.finalizedAt = new Date();

            for (const item of record.items) {
                const boqItem = await BOQItem.findById(item.boqItemId).session(session);
                if (!boqItem) throw new ApiError(404, `Không tìm thấy BOQ item ${item.boqItemId}`);
                boqItem.acceptedQty += item.currentQty;
                await boqItem.save({ session });
            }

            await record.save({ session });
            await session.commitTransaction();
            return record;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    throw new ApiError(400, 'Action không hợp lệ');
};

module.exports = {
    listAcceptance,
    createAcceptance,
    getAcceptanceById,
    updateAcceptance,
    approveAcceptance,
};
