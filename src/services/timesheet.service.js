const mongoose = require('mongoose');
const Project = require('../models/project.model');
const AttendanceRecord = require('../models/attendanceRecord.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const getProject = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Không tìm thấy dự án');
    return project;
};

const listEmployees = async (projectId, options) => {
    const project = await getProject(projectId);
    const members = project.members || [];
    const filtered = options.search
        ? members.filter((m) => (m.userId?.firstName || '').toLowerCase().includes(options.search.toLowerCase()) || (m.userId?.lastName || '').toLowerCase().includes(options.search.toLowerCase()))
        : members;
    const page = Number(options.page) || 1; const limit = Number(options.limit) || 10; const skip = (page - 1) * limit;
    const userIds = filtered.map((m) => m.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName phone');
    const userMap = new Map(users.map((u) => [u.id, u]));
    const results = filtered.slice(skip, skip + limit).map((m) => ({ ...m.toObject?.() || m, userId: userMap.get(m.userId.toString()) || null }));
    return { results, totalResults: filtered.length };
};

const addEmployee = async (projectId, body) => {
    const project = await getProject(projectId);
    if (project.members.some((m) => m.userId.toString() === body.userId)) throw new ApiError(400, 'Nhân công đã tồn tại trong dự án');
    project.members.push(body);
    await project.save();
    return project.members[project.members.length - 1];
};

const updateEmployee = async (projectId, userId, body) => {
    const project = await getProject(projectId);
    const member = project.members.find((m) => m.userId.toString() === userId);
    if (!member) throw new ApiError(404, 'Không tìm thấy nhân công trong dự án');
    Object.assign(member, body);
    await project.save();
    return member;
};

const removeEmployee = async (projectId, userId) => {
    const project = await getProject(projectId);
    project.members = project.members.filter((m) => m.userId.toString() !== userId);
    await project.save();
    return true;
};

const listTimesheets = async (projectId, filter, options) => {
    await getProject(projectId);
    const query = { projectId };
    if (filter.userId) query.userId = filter.userId;
    if (filter.workDate) query.workDate = filter.workDate;
    if (filter.status) query.status = filter.status;
    if (filter.dateFrom || filter.dateTo) query.workDate = { ...(filter.dateFrom ? { $gte: filter.dateFrom } : {}), ...(filter.dateTo ? { $lte: filter.dateTo } : {}) };
    const page = Number(options.page) || 1, limit = Number(options.limit) || 10, skip = (page - 1) * limit;
    const [results, totalResults, summary] = await Promise.all([
        AttendanceRecord.find(query).populate('userId', 'firstName lastName').sort({ workDate: -1 }).skip(skip).limit(limit),
        AttendanceRecord.countDocuments(query),
        AttendanceRecord.aggregate([{ $match: query }, { $group: { _id: null, totalDays: { $sum: 1 }, totalHours: { $sum: '$hoursWorked' }, totalAmount: { $sum: '$totalAmount' } } }]),
    ]);
    return { results, totalResults, summary: summary[0] || { totalDays: 0, totalHours: 0, totalAmount: 0 } };
};

const createTimesheets = async (projectId, body) => {
    await getProject(projectId);
    const docs = body.records.map((r) => ({ ...r, projectId, checkInLocation: r.checkInLocation ? { type: 'Point', coordinates: [r.checkInLocation.lng, r.checkInLocation.lat] } : undefined }));
    try { return await AttendanceRecord.insertMany(docs, { ordered: false }); }
    catch (e) { if (e?.code === 11000) throw new ApiError(400, 'Trùng bản ghi chấm công cho cùng nhân sự và ngày'); throw e; }
};

const updateTimesheet = async (id, body) => {
    const doc = await AttendanceRecord.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy bảng chấm công');
    if (doc.status !== 'pending') throw new ApiError(403, 'Chỉ được sửa khi trạng thái pending');
    Object.assign(doc, body);
    if (doc.checkInTime && doc.checkOutTime) doc.hoursWorked = Math.max(0, (new Date(doc.checkOutTime) - new Date(doc.checkInTime)) / 36e5);
    return await doc.save();
};

const approveTimesheet = async (id, body, userId) => {
    const doc = await AttendanceRecord.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy bảng chấm công');
    if (body.action === 'reject') { doc.status = 'rejected'; doc.note = body.note || doc.note; return await doc.save(); }
    const project = await Project.findById(doc.projectId);
    const member = project.members.find((m) => m.userId.toString() === doc.userId.toString());
    if (!member) throw new ApiError(404, 'Không tìm thấy lương ngày của nhân công');
    doc.dailyRate = member.dailyRate || 0;
    doc.totalAmount = (doc.hoursWorked / 8) * doc.dailyRate;
    doc.status = 'approved';
    doc.verifiedBy = userId;
    return await doc.save();
};

module.exports = { listEmployees, addEmployee, updateEmployee, removeEmployee, listTimesheets, createTimesheets, updateTimesheet, approveTimesheet };
