const mongoose = require('mongoose');
const Equipment = require('../models/equipment.model');
const EquipmentUsageLog = require('../models/equipmentUsage.model');
const InventoryStock = require('../models/inventory.model');
const Project = require('../models/project.model');
const WBSItem = require('../models/wbsItem.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const list = async (filter, options) => {
    const query = {};
    if (filter.type) query.type = filter.type;
    if (filter.status) query.status = filter.status;
    if (filter.search) query.$or = [
        { name: new RegExp(filter.search, 'i') },
        { code: new RegExp(filter.search, 'i') },
        { plateNo: new RegExp(filter.search, 'i') },
    ];
    const page = Number(options.page) || 1; const limit = Number(options.limit) || 10; const skip = (page - 1) * limit;
    const [results, totalResults] = await Promise.all([
        Equipment.find(query).populate('currentProjectId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Equipment.countDocuments(query),
    ]);
    return { results, totalResults };
};

const create = async (body, userId) => {
    const exists = await Equipment.findOne({ code: body.code.toUpperCase() });
    if (exists) throw new ApiError(400, 'Mã thiết bị đã tồn tại');
    const doc = new Equipment({ ...body, status: 'available', createdBy: userId });
    return await doc.save();
};

const getById = async (id) => {
    const doc = await Equipment.findById(id).populate('currentProjectId', 'name code');
    if (!doc) throw new ApiError(404, 'Không tìm thấy thiết bị');
    return doc;
};

const update = async (id, body) => {
    const doc = await Equipment.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy thiết bị');
    Object.assign(doc, body);
    return await doc.save();
};

const remove = async (id) => {
    const doc = await Equipment.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy thiết bị');
    if (!['available', 'retired'].includes(doc.status)) throw new ApiError(400, 'Chỉ được xóa thiết bị khi trạng thái available hoặc retired');
    await doc.deleteOne();
    return doc;
};

const assign = async (id, body, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const equipment = await Equipment.findById(id).session(session);
        if (!equipment) throw new ApiError(404, 'Không tìm thấy thiết bị');
        const project = await Project.findById(body.projectId).session(session);
        if (!project) throw new ApiError(404, 'Không tìm thấy dự án');
        if (body.wbsItemId) {
            const wbs = await WBSItem.findById(body.wbsItemId).session(session);
            if (!wbs) throw new ApiError(404, 'Không tìm thấy WBS item');
        }
        equipment.status = 'in_use';
        equipment.currentProjectId = body.projectId;
        await equipment.save({ session });
        await EquipmentUsageLog.create([{
            equipmentId: equipment._id,
            projectId: body.projectId,
            wbsItemId: body.wbsItemId,
            logDate: new Date(),
            hoursUsed: 0,
            note: body.note || 'Điều động thiết bị vào dự án',
        }], { session });
        await session.commitTransaction();
        return equipment;
    } catch (e) { 
        await session.abortTransaction(); 
        throw e; 
    } finally { 
        session.endSession(); 
    }
};

const createLog = async (id, body) => {
    const equipment = await Equipment.findById(id);
    if (!equipment) throw new ApiError(404, 'Không tìm thấy thiết bị');
    if (body.wbsItemId) {
        const wbs = await WBSItem.findById(body.wbsItemId);
        if (!wbs) throw new ApiError(404, 'Không tìm thấy WBS item');
    }
    if (body.operatorId) {
        const operator = await User.findById(body.operatorId);
        if (!operator) throw new ApiError(404, 'Không tìm thấy người vận hành');
    }
    const log = new EquipmentUsageLog({ equipmentId: id, ...body });
    return await log.save();
};

const listLogs = async (id, filter, options) => {
    const query = { equipmentId: id };
    if (filter.projectId) query.projectId = filter.projectId;
    if (filter.dateFrom || filter.dateTo) query.logDate = { ...(filter.dateFrom ? { $gte: filter.dateFrom } : {}), ...(filter.dateTo ? { $lte: filter.dateTo } : {}) };
    const page = Number(options.page) || 1; const limit = Number(options.limit) || 10; const skip = (page - 1) * limit;
    const [results, totalResults] = await Promise.all([
        EquipmentUsageLog.find(query).populate('projectId', 'name').populate('operatorId', 'name').sort({ logDate: -1 }).skip(skip).limit(limit),
        EquipmentUsageLog.countDocuments(query),
    ]);
    return { results, totalResults };
};

module.exports = { list, create, getById, update, remove, assign, createLog, listLogs };
