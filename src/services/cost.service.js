const mongoose = require('mongoose');
const CostSummary = require('../models/costSumary.model');
const Project = require('../models/project.model');
const ApiError = require('../utils/ApiError');

const assertProject = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Không tìm thấy dự án');
};

const listCosts = async (projectId, filter) => {
    await assertProject(projectId);
    const match = { projectId };
    if (filter.period) match.period = filter.period;
    if (filter.category) match.category = filter.category;
    if (filter.wbsItemId) match.wbsItemId = filter.wbsItemId;
    const [agg] = await CostSummary.aggregate([
        { $match: match },
        {
            $facet: {
                results: [{
                    $sort: {
                        period: 1,
                        category: 1
                    }
                }],
                totals: [{
                    $group: {
                        _id: null,
                        planned: {
                            $sum: '$plannedCost'
                        },
                        committed: {
                            $sum: '$committedCost'
                        },
                        actual: {
                            $sum: '$actualCost'
                        },
                        forecast: {
                            $sum: '$forecastCost'
                        }
                    }
                }]
            }
        },
    ]);
    return {
        results: agg?.results || [],
        totals: agg?.totals?.[0] || { planned: 0, committed: 0, actual: 0, forecast: 0 }
    };
};

const createCost = async (projectId, body) => {
    await assertProject(projectId);
    
    return await CostSummary.findOneAndUpdate(
        { projectId, period: body.period, category: body.category },
        { $set: { ...body, projectId, updatedAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

const updateCost = async (id, body) => {
    const doc = await CostSummary.findById(id);

    if (!doc) throw new ApiError(404, 'Không tìm thấy kế hoạch chi phí');

    Object.assign(doc, body, { updatedAt: new Date() });

    return await doc.save();
};

const approveCost = async (id, action) => {
    const doc = await CostSummary.findById(id);

    if (!doc) throw new ApiError(404, 'Không tìm thấy kế hoạch chi phí');

    doc.status = action === 'approve' ? 'approved' : 'draft';

    doc.updatedAt = new Date();
    return await doc.save();
};

module.exports = {
    listCosts,
    createCost,
    updateCost,
    approveCost
};
