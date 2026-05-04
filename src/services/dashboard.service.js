const mongoose = require('mongoose');
const Project = require('../models/project.model');
const WBSItem = require('../models/wbsItem.model');
const CostSummary = require('../models/costSumary.model');
const InventoryStock = require('../models/inventory.model');
const MaterialRequest = require('../models/materialRequest.model');
const AcceptanceRecord = require('../models/acceptance.model');
const ProgressUpdate = require('../models/progressUpdate.model');
const SiteDiary = require('../models/siteDiary.model');
const ApiError = require('../utils/ApiError');


const buildProjectScopeMatch = (user) => {
    if (!user) return {};
    if (['admin', 'ceo'].includes(user.role)) return {};
    if (['pm', 'supervisor'].includes(user.role)) {
        return {
            $or: [
                { createdBy: new mongoose.Types.ObjectId(user.id) },
                { 'members.userId': new mongoose.Types.ObjectId(user.id) },
                { 'members.role': { $in: ['pm', 'supervisor'] }, 'members.userId': new mongoose.Types.ObjectId(user.id) },
            ],
        };
    }
    if (['engineer', 'warehouse'].includes(user.role)) {
        return { 'members.userId': new mongoose.Types.ObjectId(user.id) };
    }
    return { 'members.userId': new mongoose.Types.ObjectId(user.id) };
};

const getScopedProjectIds = async (user) => {
    const match = buildProjectScopeMatch(user);
    if (!Object.keys(match).length) {
        const all = await Project.find({}).select('_id').lean();
        return all.map((p) => p._id);
    }
    const projects = await Project.find(match).select('_id').lean();
    return projects.map((p) => p._id);
};

const formatActivities = async (projectObjectIds, skip, limit) => {
    const pipeline = [
        { $match: { projectId: { $in: projectObjectIds } } },
        { $project: { type: { $literal: 'progress_update' }, projectId: 1, createdAt: 1, message: { $concat: ['Tiến độ cập nhật: ', { $ifNull: ['$note', ''] }] }, actorId: '$reportedBy', link: { $concat: ['/progress-updates/', { $toString: '$_id' }] } } },
        {
            $unionWith: {
                coll: 'materialrequests',
                pipeline: [
                    { $match: { projectId: { $in: projectObjectIds } } },
                    { $project: { type: { $literal: 'material_request' }, projectId: 1, createdAt: 1, message: { $concat: ['Phiếu vật tư ', '$code', ' - ', '$status'] }, actorId: '$requestedBy', link: { $concat: ['/material-requests/', { $toString: '$_id' }] } } },
                ],
            },
        },
        {
            $unionWith: {
                coll: 'acceptancerecords',
                pipeline: [
                    { $match: { projectId: { $in: projectObjectIds } } },
                    { $project: { type: { $literal: 'acceptance_record' }, projectId: 1, createdAt: 1, message: { $concat: ['Biên bản nghiệm thu ', '$code'] }, actorId: '$submittedBy', link: { $concat: ['/acceptance/', { $toString: '$_id' }] } } },
                ],
            },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit + 1 },
        { $lookup: { from: 'users', localField: 'actorId', foreignField: '_id', as: 'actor' } },
        { $unwind: { path: '$actor', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } },
        { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
        { $project: { type: 1, createdAt: 1, message: 1, link: 1, projectName: '$project.name', actorName: { $ifNull: ['$actor.name', { $concat: ['$actor.firstName', ' ', '$actor.lastName'] }] } } },
    ];
    const results = await ProgressUpdate.aggregate(pipeline);
    return { results: results.slice(0, limit), hasMore: results.length > limit };
};

const getSummary = async (user) => {
    const projectIds = await getScopedProjectIds(user);
    const projectObjectIds = projectIds.map((id) => new mongoose.Types.ObjectId(id));
    const projectMatch = projectObjectIds.length ? { _id: { $in: projectObjectIds } } : { _id: null };
    const nearDeadlineDate = new Date();
    nearDeadlineDate.setDate(nearDeadlineDate.getDate() + 14);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [projectsAgg, progressAgg, budgetAgg, lowStockAgg, activeProjects, alertsNested, progressChartAgg, recentActivitiesAgg, pendingRequestsCount] = await Promise.all([
        Project.aggregate([{ $match: projectMatch }, { $group: { _id: null, total: { $sum: 1 }, inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } }, delayed: { $sum: { $cond: [{ $and: [{ $ne: ['$endDate', null] }, { $lt: ['$endDate', new Date()] }, { $ne: ['$status', 'completed'] }] }, 1, 0] } }, nearDeadline: { $sum: { $cond: [{ $and: [{ $ne: ['$endDate', null] }, { $lte: ['$endDate', nearDeadlineDate] }, { $gte: ['$endDate', new Date()] }] }, 1, 0] } } } }]),
        WBSItem.aggregate([{ $match: { projectId: { $in: projectObjectIds }, status: { $in: ['in_progress', 'completed', 'delayed', 'paused'] } } }, { $group: { _id: null, avgCompletion: { $avg: '$completionPct' } } }]),
        CostSummary.aggregate([{ $match: { projectId: { $in: projectObjectIds } } }, { $group: { _id: null, planned: { $sum: '$plannedCost' }, committed: { $sum: '$committedCost' }, actual: { $sum: '$actualCost' } } }]),
        InventoryStock.aggregate([{ $match: { projectId: { $in: projectObjectIds }, qtyAvailable: { $lte: 0 } } }, { $group: { _id: '$materialId' } }]),
        Project.find({ _id: { $in: projectObjectIds }, status: 'in_progress' }).sort({ updatedAt: -1 }).limit(5).select('name code status updatedAt'),
        Promise.all([
            MaterialRequest.aggregate([{ $match: { projectId: { $in: projectObjectIds }, status: 'pending' } }, { $sort: { createdAt: -1 } }, { $limit: 5 }, { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } }, { $unwind: '$project' }, { $project: { type: { $literal: 'material_request' }, severity: { $literal: 'medium' }, message: { $concat: ['Phiếu vật tư ', '$code', ' đang chờ duyệt'] }, projectName: '$project.name', timeAgo: '$createdAt', link: { $concat: ['/material-requests/', { $toString: '$_id' }] } } }]),
            WBSItem.aggregate([{ $match: { projectId: { $in: projectObjectIds }, plannedEnd: { $lt: new Date() }, status: { $ne: 'completed' } } }, { $sort: { plannedEnd: 1 } }, { $limit: 5 }, { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } }, { $unwind: '$project' }, { $project: { type: { $literal: 'wbs_delay' }, severity: { $literal: 'high' }, message: { $concat: ['Công việc ', '$name', ' đã trễ hạn'] }, projectName: '$project.name', timeAgo: '$updatedAt', link: { $concat: ['/wbs-items/', { $toString: '$_id' }] } } }]),
            InventoryStock.aggregate([{ $match: { projectId: { $in: projectObjectIds }, qtyAvailable: { $lte: 0 } } }, { $limit: 5 }, { $lookup: { from: 'materials', localField: 'materialId', foreignField: '_id', as: 'material' } }, { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } }, { $unwind: '$material' }, { $unwind: '$project' }, { $project: { type: { $literal: 'low_stock' }, severity: { $literal: 'high' }, message: { $concat: ['Vật tư ', '$material.name', ' sắp hết'] }, projectName: '$project.name', timeAgo: '$updatedAt', link: { $concat: ['/materials/', { $toString: '$materialId' }] } } }]),
        ]).then((arr) => arr.flat().sort((a, b) => new Date(b.timeAgo) - new Date(a.timeAgo)).slice(0, 5)),
        ProgressUpdate.aggregate([{ $match: { projectId: { $in: projectObjectIds }, createdAt: { $gte: sixMonthsAgo } } }, { $project: { month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, status: 1 } }, { $group: { _id: '$month', completed: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } } } }, { $sort: { _id: 1 } }, { $limit: 6 }]),
        formatActivities(projectObjectIds, 0, 5),
        MaterialRequest.countDocuments({ projectId: { $in: projectObjectIds }, status: 'pending' }),
    ]);

    const summary = {
        kpis: {
            projects: projectsAgg[0] || { total: 0, inProgress: 0, delayed: 0, nearDeadline: 0 },
            progress: progressAgg[0]?.avgCompletion || 0,
            budget: budgetAgg[0] || { planned: 0, committed: 0, actual: 0 },
            materials: {
                lowStockCount: lowStockAgg.length,
                pendingRequests: pendingRequestsCount,
            },
        },
        activeProjects,
        alerts: alertsNested,
        progressChart: progressChartAgg,
        recentActivities: recentActivitiesAgg.results,
    };

    return summary;
};

const getAlerts = async (user) => {
    const projectIds = await getScopedProjectIds(user);
    const projectObjectIds = projectIds.map((id) => new mongoose.Types.ObjectId(id));
    const [pendingReqs, overdueTasks, lowStocks] = await Promise.all([
        MaterialRequest.aggregate([{ $match: { projectId: { $in: projectObjectIds }, status: 'pending' } }, { $sort: { createdAt: -1 } }, { $limit: 10 }, { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } }, { $unwind: '$project' }, { $project: { type: { $literal: 'material_request' }, severity: { $literal: 'medium' }, message: { $concat: ['Phiếu vật tư ', '$code', ' đang chờ duyệt'] }, projectName: '$project.name', timeAgo: '$createdAt', link: { $concat: ['/material-requests/', { $toString: '$_id' }] } } }]),
        WBSItem.aggregate([{ $match: { projectId: { $in: projectObjectIds }, plannedEnd: { $lt: new Date() }, status: { $ne: 'completed' } } }, { $sort: { plannedEnd: 1 } }, { $limit: 10 }, { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } }, { $unwind: '$project' }, { $project: { type: { $literal: 'task_delay' }, severity: { $literal: 'high' }, message: { $concat: ['Task ', '$name', ' đã trễ hạn'] }, projectName: '$project.name', timeAgo: '$plannedEnd', link: { $concat: ['/wbs-items/', { $toString: '$_id' }] } } }]),
        InventoryStock.aggregate([{ $match: { projectId: { $in: projectObjectIds }, qtyAvailable: { $lte: 0 } } }, { $limit: 10 }, { $lookup: { from: 'materials', localField: 'materialId', foreignField: '_id', as: 'material' } }, { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } }, { $unwind: '$material' }, { $unwind: '$project' }, { $project: { type: { $literal: 'low_stock' }, severity: { $literal: 'high' }, message: { $concat: ['Vật tư ', '$material.name', ' dưới mức an toàn'] }, projectName: '$project.name', timeAgo: '$updatedAt', link: { $concat: ['/materials/', { $toString: '$materialId' }] } } }]),
    ]);
    const alerts = [...pendingReqs, ...overdueTasks, ...lowStocks].sort((a, b) => new Date(b.timeAgo) - new Date(a.timeAgo));
    return { alerts: alerts.slice(0, 20), count: alerts.length };
};

const getActivities = async (user, { page = 1, limit = 10 }) => {
    const projectIds = await getScopedProjectIds(user);
    const projectObjectIds = projectIds.map((id) => new mongoose.Types.ObjectId(id));
    const skip = (Number(page) - 1) * Number(limit);
    const pipeline = [
        { $match: { projectId: { $in: projectObjectIds } } },
        { $project: { type: { $literal: 'progress_update' }, projectId: 1, createdAt: 1, message: { $concat: ['Tiến độ cập nhật: ', { $ifNull: ['$note', ''] }] }, actorId: '$reportedBy', link: { $concat: ['/progress-updates/', { $toString: '$_id' }] } } },
        { $unionWith: { coll: 'materialrequests', pipeline: [{ $match: { projectId: { $in: projectObjectIds } } }, { $project: { type: { $literal: 'material_request' }, projectId: 1, createdAt: 1, message: { $concat: ['Phiếu vật tư ', '$code', ' - ', '$status'] }, actorId: '$requestedBy', link: { $concat: ['/material-requests/', { $toString: '$_id' }] } } }] } },
        { $unionWith: { coll: 'acceptancerecords', pipeline: [{ $match: { projectId: { $in: projectObjectIds } } }, { $project: { type: { $literal: 'acceptance_record' }, projectId: 1, createdAt: 1, message: { $concat: ['Biên bản nghiệm thu ', '$code'] }, actorId: '$submittedBy', link: { $concat: ['/acceptance/', { $toString: '$_id' }] } } }] } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) + 1 },
        { $lookup: { from: 'users', localField: 'actorId', foreignField: '_id', as: 'actor' } },
        { $unwind: { path: '$actor', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } },
        { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
        { $project: { type: 1, createdAt: 1, message: 1, link: 1, projectName: '$project.name', actorName: { $ifNull: ['$actor.name', { $concat: ['$actor.firstName', ' ', '$actor.lastName'] }] } } },
    ];
    const results = await ProgressUpdate.aggregate(pipeline);
    return { results: results.slice(0, Number(limit)), hasMore: results.length > Number(limit) };
};

module.exports = { getSummary, getAlerts, getActivities };
