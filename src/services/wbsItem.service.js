const WBSItem = require('../models/wbsItem.model');
const ProgressUpdate = require('../models/progressUpdate.model');
const ApiError = require('../utils/ApiError');

const createWbsItem = async (projectId, body, userId) => {
    let parent = null;
    let level = 0;
    let treeCode = '1';
    let sortOrder = 0;

    if (body.parentId) {
        parent = await WBSItem.findById(body.parentId);
        if (!parent || parent.projectId.toString() !== projectId.toString()) {
            throw new ApiError(404, 'WBS Item cha không tồn tại hoặc không thuộc dự án này');
        }

        level = parent.level + 1;

        if (parent.isLeaf) {
            parent.isLeaf = false;
            await parent.save();
        }

        const siblingsCount = await WBSItem.countDocuments({ projectId, parentId: body.parentId });
        sortOrder = siblingsCount;
        treeCode = `${parent.treeCode}.${siblingsCount + 1}`;
    } else {
        const rootCount = await WBSItem.countDocuments({ projectId, parentId: null });
        sortOrder = rootCount;
        treeCode = `${rootCount + 1}`;
    }

    const data = {
        ...body,
        projectId,
        level,
        treeCode,
        sortOrder,
        createdBy: userId
    };

    return await WBSItem.create(data);
};

const getProjectWbs = async (projectId) => {
    return await WBSItem.find({ projectId })
        .sort({ treeCode: 1, sortOrder: 1 })
        .populate('assignees', 'firstName lastName email profileImage')
};

const getWbsItemById = async (id) => {
    const item = await WBSItem.findById(id).populate('assignees', 'firstName lastName email');
    if (!item) {
        throw new ApiError(404, 'Không tìm thấy công việc này');
    }
    return item;
};

const updateWbsItemById = async (id, updateBody) => {
    const item = await getWbsItemById(id);

    if (updateBody.code && updateBody.code !== item.code) {
        const isCodeTaken = await WBSItem.exists({ projectId: item.projectId, code: updateBody.code });
        if (isCodeTaken) {
            throw new ApiError(400, 'Mã công việc đã tồn tại trong dự án này');
        }
    }

    Object.assign(item, updateBody);
    await item.save();
    return item;
};

const deleteWbsItemById = async (id) => {
    const item = await getWbsItemById(id);

    const descendantRegex = new RegExp(`^${item.treeCode}\\.`);

    const itemsToDelete = await WBSItem.find({
        projectId: item.projectId,
        $or: [
            { _id: item._id },
            { treeCode: descendantRegex }
        ]
    }).select('_id');

    const idsToDelete = itemsToDelete.map(doc => doc._id);

    await WBSItem.deleteMany({ _id: { $in: idsToDelete } });

    await ProgressUpdate.deleteMany({ wbsItemId: { $in: idsToDelete } });

    if (item.parentId) {
        const remainingSiblings = await WBSItem.exists({ parentId: item.parentId });
        if (!remainingSiblings) {
            await WBSItem.findByIdAndUpdate(item.parentId, { isLeaf: true });
        }
    }

    return item;
};

module.exports = {
    createWbsItem,
    getProjectWbs,
    getWbsItemById,
    updateWbsItemById,
    deleteWbsItemById
};