const mongoose = require('mongoose');
const DocumentFolder = require('../models/document.model');
const ProjectDocument = require('../models/projectDoc.model');
const Project = require('../models/project.model');
const ApiError = require('../utils/ApiError');
const cloudinaryService = require('./cloudinary.service');

const assertProject = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Không tìm thấy dự án');
    return project;
};

const listFolders = async (projectId, parentId) => {
    await assertProject(projectId);
    const query = { projectId, parentId: parentId || null };
    const folders = await DocumentFolder.find(query).sort({ sortOrder: 1, createdAt: 1 }).lean();
    const folderIds = folders.map(f => f._id);
    const [childCounts, docCounts] = await Promise.all([
        DocumentFolder.aggregate([{ $match: { projectId: new mongoose.Types.ObjectId(projectId), parentId: { $in: folderIds } } }, { $group: { _id: '$parentId', count: { $sum: 1 } } }]),
        ProjectDocument.aggregate([{ $match: { projectId: new mongoose.Types.ObjectId(projectId), folderId: { $in: folderIds }, isArchived: false } }, { $group: { _id: '$folderId', count: { $sum: 1 } } }]),
    ]);
    const childMap = new Map(childCounts.map(x => [x._id.toString(), x.count]));
    const docMap = new Map(docCounts.map(x => [x._id.toString(), x.count]));
    return folders.map(f => ({ ...f, childCount: childMap.get(f._id.toString()) || 0, documentCount: docMap.get(f._id.toString()) || 0 }));
};

const createFolder = async (projectId, body, userId) => {
    await assertProject(projectId);
    if (body.parentId) await DocumentFolder.findOne({ _id: body.parentId, projectId }).orFail(new ApiError(404, 'Thư mục cha không tồn tại'));
    return await DocumentFolder.create({ ...body, projectId, createdBy: userId, parentId: body.parentId || null });
};

const checkCircular = async (folderId, newParentId) => {
    if (!newParentId) return;
    if (folderId.toString() === newParentId.toString()) throw new ApiError(400, 'Không được di chuyển thư mục vào chính nó');
    let current = await DocumentFolder.findById(newParentId).select('_id parentId');
    while (current) {
        if (current.parentId && current.parentId.toString() === folderId.toString()) throw new ApiError(400, 'Không được di chuyển thư mục vào thư mục con/cháu của chính nó');
        if (current._id.toString() === folderId.toString()) throw new ApiError(400, 'Không được di chuyển thư mục vào thư mục con/cháu của chính nó');
        current = current.parentId ? await DocumentFolder.findById(current.parentId).select('_id parentId') : null;
    }
};

const updateFolder = async (id, body) => {
    const folder = await DocumentFolder.findById(id);
    if (!folder) throw new ApiError(404, 'Không tìm thấy thư mục');
    if (body.parentId !== undefined && body.parentId !== null) {
        await checkCircular(folder._id, body.parentId);
    }
    Object.assign(folder, { ...body, parentId: body.parentId ?? folder.parentId });
    return await folder.save();
};

const deleteFolder = async (id) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const folder = await DocumentFolder.findById(id).session(session);
        if (!folder) throw new ApiError(404, 'Không tìm thấy thư mục');
        await ProjectDocument.updateMany({ folderId: folder._id }, { $set: { isArchived: true } }, { session });
        await DocumentFolder.deleteOne({ _id: folder._id }, { session });
        await session.commitTransaction();
        return folder;
    } catch (e) {
        await session.abortTransaction();
        throw e;
    } finally {
        session.endSession();
    }
};

const listDocuments = async (projectId, filter, options) => {
    await assertProject(projectId);

    const query = { projectId, isArchived: false };
    if (filter.folderId !== undefined) query.folderId = filter.folderId || null;
    if (filter.category) query.category = filter.category;
    if (filter.tags) query.tags = { $in: Array.isArray(filter.tags) ? filter.tags : [filter.tags] };
    if (filter.search) query.$text = { $search: filter.search };

    const page = Number(options.page) || 1, limit = Number(options.limit) || 10, skip = (page - 1) * limit;
    const [results, totalResults] = await Promise.all([
        ProjectDocument.find(query).populate('uploadedBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        ProjectDocument.countDocuments(query),
    ]);
    return { results, totalResults };
};

const createDocument = async (projectId, body, userId) => {
    await assertProject(projectId);
    if (body.folderId) await DocumentFolder.findOne({ _id: body.folderId, projectId }).orFail(new ApiError(404, 'Thư mục không tồn tại'));

    return await ProjectDocument.create({
        ...body,
        projectId,
        uploadedBy: userId,
        isArchived: false
    });
};

const updateDocument = async (id, body) => {
    const doc = await ProjectDocument.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy tài liệu');

    const mutable = { ...body };

    delete mutable.fileUrl; delete mutable.publicId; delete mutable.fileSize; delete mutable.mimeType;

    if (mutable.folderId) await DocumentFolder.findById(mutable.folderId).orFail(new ApiError(404, 'Thư mục không tồn tại'));
    Object.assign(doc, mutable);
    
    return await doc.save();
};

const deleteDocument = async (id) => {
    const doc = await ProjectDocument.findById(id);
    if (!doc) throw new ApiError(404, 'Không tìm thấy tài liệu');
    doc.isArchived = true;
    await doc.save();
    if (doc.publicId) await cloudinaryService.deleteFile(doc.publicId);
    return doc;
};

module.exports = { listFolders, createFolder, updateFolder, deleteFolder, listDocuments, createDocument, updateDocument, deleteDocument };
