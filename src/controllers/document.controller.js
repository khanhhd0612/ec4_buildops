const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const service = require('../services/document.service');

const listFolders = catchAsync(async (req, res) => {
    const data = await service.listFolders(req.params.projectId, req.query.parentId ?? null);

    res.json({
        status: 'success',
        data
    });
});

const createFolder = catchAsync(async (req, res) => {
    const data = await service.createFolder(req.params.projectId, req.body, req.user.id);

    res.status(201).json({
        status: 'success',
        data
    });
});

const updateFolder = catchAsync(async (req, res) => {
    const data = await service.updateFolder(req.params.id, req.body);

    res.json({
        status: 'success',
        data
    });
});

const deleteFolder = catchAsync(async (req, res) => {
    await service.deleteFolder(req.params.id);

    res.json({
        status: 'success',
        message: 'Xóa thư mục thành công'
    });
});

const listDocuments = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['folderId', 'category', 'tags', 'search']);
    const options = pick(req.query, ['page', 'limit']);

    const data = await service.listDocuments(req.params.projectId, filter, options);

    res.json({
        status: 'success',
        data
    });
});

const createDocument = catchAsync(async (req, res) => {
    const data = await service.createDocument(req.params.projectId, req.body, req.user.id);

    res.status(201).json({
        status: 'success',
        data
    });
});

const updateDocument = catchAsync(async (req, res) => {
    const data = await service.updateDocument(req.params.id, req.body);

    res.json({
        status: 'success',
        data
    });
});

const deleteDocument = catchAsync(async (req, res) => {
    await service.deleteDocument(req.params.id);
    res.json({
        status: 'success',
        message: 'Xóa tài liệu thành công'
    });
});

module.exports = {
    listFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    listDocuments,
    createDocument,
    updateDocument,
    deleteDocument
};
