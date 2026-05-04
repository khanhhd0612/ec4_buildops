const ProgressUpdate = require('../models/progressUpdate.model');
const WBSItem = require('../models/wbsItem.model');
const ApiError = require('../utils/ApiError');

const createProgressUpdate = async (updateBody, userId) => {
    const wbsItem = await WBSItem.findById(updateBody.wbsItemId);
    if (!wbsItem) {
        throw new ApiError(404, 'Công việc (WBS Item) không tồn tại');
    }

    try {
        const data = {
            ...updateBody,
            projectId: wbsItem.projectId,
            reportedBy: userId
        };
        return await ProgressUpdate.create(data);
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(400, 'Đã tồn tại báo cáo cho công việc này trong ngày hôm nay');
        }
        throw error;
    }
};

const queryProgressUpdates = async (filter, options) => {
    return await ProgressUpdate.paginate(filter, {
        ...options,
        populate: [
            { path: 'reportedBy', select: 'firstName lastName email' },
            { path: 'approvedBy', select: 'firstName lastName email' }
        ]
    });
};

const approveProgressUpdateById = async (updateId, status, approverId, note) => {
    const update = await ProgressUpdate.findById(updateId);
    if (!update) {
        throw new ApiError(404, 'Không tìm thấy báo cáo tiến độ');
    }

    if (update.status === 'approved' && status === 'approved') {
        throw new ApiError(400, 'Báo cáo này đã được duyệt từ trước');
    }

    update.status = status;
    update.approvedBy = approverId;
    update.approvedAt = new Date();

    if (note) {
        update.note = update.note ? `${update.note}\n[QL phản hồi]: ${note}` : `[QL phản hồi]: ${note}`;
    }

    await update.save();

    // Nếu duyệt báo cáo, tự động cập nhật tiến độ lên WBS Item
    if (status === 'approved') {
        const wbsItem = await WBSItem.findById(update.wbsItemId);
        if (wbsItem) {
            wbsItem.actualQty = update.completedQty;
            wbsItem.completionPct = update.completionPct;
            wbsItem.status = update.completionPct === 100 ? 'completed' : 'in_progress';

            if (!wbsItem.actualStart) {
                wbsItem.actualStart = update.reportDate; // Đánh dấu ngày bắt đầu thực tế
            }

            await wbsItem.save();
        }
    }

    return update;
};

module.exports = {
    createProgressUpdate,
    queryProgressUpdates,
    approveProgressUpdateById
};