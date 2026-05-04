const ExcelJS = require('exceljs');
const mongoose = require('mongoose');
const Project = require('../models/project.model');
const WBSItem = require('../models/wbsItem.model');
const CostSummary = require('../models/costSumary.model');
const InventoryStock = require('../models/inventory.model');
const InventoryTransaction = require('../models/inventoryTransaction.model');
const Material = require('../models/material.model');
const AttendanceRecord = require('../models/attendanceRecord.model');
const ApiError = require('../utils/ApiError');

const assertProject = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Không tìm thấy dự án');
    return project;
};

const buildDateMatch = (field, dateFrom, dateTo) => ({
    ...(dateFrom || dateTo ? { [field]: { ...(dateFrom ? { $gte: new Date(dateFrom) } : {}), ...(dateTo ? { $lte: new Date(dateTo) } : {} ) } } : {}),
});

const getProgressReport = async (projectId, filter) => {
    await assertProject(projectId);
    const match = { projectId: new mongoose.Types.ObjectId(projectId), ...(filter.wbsItemId ? { _id: new mongoose.Types.ObjectId(filter.wbsItemId) } : {}) };
    if (filter.dateFrom || filter.dateTo) {
        match.$or = [
            buildDateMatch('plannedStart', filter.dateFrom, filter.dateTo),
            buildDateMatch('plannedEnd', filter.dateFrom, filter.dateTo),
            buildDateMatch('actualStart', filter.dateFrom, filter.dateTo),
            buildDateMatch('actualEnd', filter.dateFrom, filter.dateTo),
        ].filter((x) => Object.keys(x).length);
    }

    const [summaryAgg, byMonthAgg, wbsItems] = await Promise.all([
        WBSItem.aggregate([
            { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
            { $group: { _id: null, totalTasks: { $sum: 1 }, completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, delayedTasks: { $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] } }, avgCompletionPct: { $avg: '$completionPct' } } },
        ]),
        // Group by month from plannedStart; if missing then actualStart. We use dateToString to normalize YYYY-MM.
        WBSItem.aggregate([
            { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
            { $project: { month: { $dateToString: { format: '%Y-%m', date: { $ifNull: ['$plannedStart', '$actualStart'] } } }, planned: '$plannedCost', actual: '$actualCost' } },
            { $group: { _id: '$month', planned: { $sum: '$planned' }, actual: { $sum: '$actual' } } },
            { $sort: { _id: 1 } },
        ]),
        WBSItem.find(match).sort({ treeCode: 1 }).lean(),
    ]);

    return {
        summary: summaryAgg[0] || { totalTasks: 0, completedTasks: 0, delayedTasks: 0, avgCompletionPct: 0 },
        byMonth: byMonthAgg,
        wbsItems,
    };
};

const getCostReport = async (projectId, filter) => {
    await assertProject(projectId);
    const match = { projectId: new mongoose.Types.ObjectId(projectId) };
    if (filter.period) match.period = filter.period;
    if (filter.category) match.category = filter.category;
    const [summary, byCategory, byMonth] = await Promise.all([
        CostSummary.aggregate([{ $match: match }, { $group: { _id: null, plannedCost: { $sum: '$plannedCost' }, committedCost: { $sum: '$committedCost' }, actualCost: { $sum: '$actualCost' }, forecastCost: { $sum: '$forecastCost' } } }]),
        CostSummary.aggregate([{ $match: match }, { $group: { _id: '$category', plannedCost: { $sum: '$plannedCost' }, committedCost: { $sum: '$committedCost' }, actualCost: { $sum: '$actualCost' }, forecastCost: { $sum: '$forecastCost' } } }, { $sort: { _id: 1 } }]),
        // Group by month period string YYYY-MM; keep sorted chronologically.
        CostSummary.aggregate([{ $match: match }, { $group: { _id: '$period', plannedCost: { $sum: '$plannedCost' }, committedCost: { $sum: '$committedCost' }, actualCost: { $sum: '$actualCost' }, forecastCost: { $sum: '$forecastCost' } } }, { $sort: { _id: 1 } }]),
    ]);
    const s = summary[0] || { plannedCost: 0, committedCost: 0, actualCost: 0, forecastCost: 0 };
    return { summary: { ...s, variance: s.plannedCost - s.actualCost }, byCategory, byMonth, overBudget: s.actualCost > s.plannedCost };
};

const getMaterialReport = async (projectId, filter) => {
    await assertProject(projectId);
    const match = { projectId: new mongoose.Types.ObjectId(projectId), ...(filter.materialId ? { materialId: new mongoose.Types.ObjectId(filter.materialId) } : {}) };
    const stock = await InventoryStock.aggregate([
        { $match: match },
        { $lookup: { from: 'materials', localField: 'materialId', foreignField: '_id', as: 'material' } },
        { $unwind: '$material' },
        { $project: { materialId: 1, qtyOnHand: 1, qtyAvailable: 1, qtyReserved: 1, totalValue: { $multiply: ['$qtyOnHand', { $ifNull: ['$material.referencePrice', 0] }] }, 'material.code': 1, 'material.name': 1, 'material.unit': 1, 'material.category': 1 } },
    ]);
    const movements = await InventoryTransaction.aggregate([
        { $match: { projectId: new mongoose.Types.ObjectId(projectId), ...(filter.dateFrom || filter.dateTo ? { transactionDate: { ...(filter.dateFrom ? { $gte: new Date(filter.dateFrom) } : {}), ...(filter.dateTo ? { $lte: new Date(filter.dateTo) } : {}) } } : {}) } },
        { $unwind: '$items' },
        { $lookup: { from: 'materials', localField: 'items.materialId', foreignField: '_id', as: 'material' } },
        { $unwind: '$material' },
        { $group: { _id: { month: { $dateToString: { format: '%Y-%m', date: '$transactionDate' } }, type: '$type', materialId: '$items.materialId' }, qty: { $sum: '$items.qty' }, totalValue: { $sum: '$items.totalPrice' }, materialName: { $first: '$material.name' }, unit: { $first: '$material.unit' } } },
        { $sort: { '_id.month': 1 } },
    ]);
    const lowStockItems = stock.filter((s) => (s.qtyAvailable || 0) <= 0);
    return { stock, movements, lowStockItems };
};

const getAttendanceReport = async (projectId, filter) => {
    await assertProject(projectId);
    const match = { projectId: new mongoose.Types.ObjectId(projectId) };
    if (filter.userId) match.userId = new mongoose.Types.ObjectId(filter.userId);
    if (filter.dateFrom || filter.dateTo) match.workDate = { ...(filter.dateFrom ? { $gte: new Date(filter.dateFrom) } : {}), ...(filter.dateTo ? { $lte: new Date(filter.dateTo) } : {}) };
    const [summary, byUser, byDate] = await Promise.all([
        AttendanceRecord.aggregate([{ $match: match }, { $group: { _id: null, totalDays: { $sum: 1 }, totalHours: { $sum: '$hoursWorked' }, totalAmount: { $sum: '$totalAmount' } } }]),
        AttendanceRecord.aggregate([{ $match: match }, { $group: { _id: '$userId', totalDays: { $sum: 1 }, totalHours: { $sum: '$hoursWorked' }, totalAmount: { $sum: '$totalAmount' } } }, { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }, { $unwind: '$user' }, { $project: { userId: '$_id', totalDays: 1, totalHours: 1, totalAmount: 1, name: { $ifNull: ['$user.name', { $concat: ['$user.firstName', ' ', '$user.lastName'] }] } } }]),
        AttendanceRecord.aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$workDate' } }, totalDays: { $sum: 1 }, totalHours: { $sum: '$hoursWorked' }, totalAmount: { $sum: '$totalAmount' } } }, { $sort: { _id: 1 } }]),
    ]);
    return { summary: summary[0] || { totalDays: 0, totalHours: 0, totalAmount: 0 }, byUser, byDate };
};

const getInsight = async (projectId) => {
    await assertProject(projectId);
    const projectObjId = new mongoose.Types.ObjectId(projectId);
    const [wbsAgg, costAgg] = await Promise.all([
        WBSItem.aggregate([{ $match: { projectId: projectObjId } }, { $group: { _id: null, bac: { $sum: '$plannedCost' }, actualPct: { $avg: '$completionPct' }, pv: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$plannedCost', { $multiply: ['$plannedCost', { $divide: ['$completionPct', 100] }] }] } } } }]),
        CostSummary.aggregate([{ $match: { projectId: projectObjId } }, { $group: { _id: null, ac: { $sum: '$actualCost' } } }]),
    ]);
    const bac = wbsAgg[0]?.bac || 0;
    const actualPct = (wbsAgg[0]?.actualPct || 0) / 100;
    const pv = wbsAgg[0]?.pv || 0;
    const ac = costAgg[0]?.ac || 0;
    const ev = bac * actualPct;
    const spi = pv > 0 ? ev / pv : 0;
    const cpi = ac > 0 ? ev / ac : 0;
    const eac = cpi > 0 ? bac / cpi : bac;
    const recommendations = [];
    if (spi < 1) recommendations.push('Dự án đang chậm tiến độ');
    if (cpi < 1) recommendations.push('Dự án đang vượt chi phí');
    const riskLevel = spi < 0.9 || cpi < 0.9 ? 'high' : spi < 1 || cpi < 1 ? 'medium' : 'low';
    return { bac, actualPct, pv, ac, ev, spi, cpi, eac, riskLevel, recommendations };
};

const exportReport = async (projectId, query) => {
    const workbook = new ExcelJS.Workbook();
    const dataMap = {
        progress: await getProgressReport(projectId, query),
        cost: await getCostReport(projectId, query),
        material: await getMaterialReport(projectId, query),
        attendance: await getAttendanceReport(projectId, query),
    };
    const sheet = workbook.addWorksheet(`${query.type}`);
    const data = dataMap[query.type];
    sheet.addRow([`${query.type.toUpperCase()} REPORT`]);
    sheet.addRow([]);
    sheet.addRow([JSON.stringify(data.summary || data, null, 2)]);
    return workbook;
};

module.exports = { getProgressReport, getCostReport, getMaterialReport, getAttendanceReport, exportReport, getInsight };
