const catchAsync = require('../utils/catchAsync');
const wbsItemService = require('../services/wbsItem.service');

const createWbsItem = catchAsync(async (req, res) => {
    const item = await wbsItemService.createWbsItem(req.params.projectId, req.body, req.user.id);

    res.status(201).json({
        status: 'success',
        message: 'Tạo cấu trúc công việc thành công',
        data: item
    });
});

const getProjectWbs = catchAsync(async (req, res) => {
    const wbsList = await wbsItemService.getProjectWbs(req.params.projectId);

    res.status(200).json({
        status: 'success',
        data: wbsList
    });
});

const getWbsItem = catchAsync(async (req, res) => {
    const item = await wbsItemService.getWbsItemById(req.params.id);
    
    res.status(200).json({
        status: 'success',
        data: item
    });
});

const updateWbsItem = catchAsync(async (req, res) => {
    const item = await wbsItemService.updateWbsItemById(req.params.id, req.body);

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật cấu trúc công việc thành công',
        data: item
    });
});

const deleteWbsItem = catchAsync(async (req, res) => {
    await wbsItemService.deleteWbsItemById(req.params.id);

    res.status(200).json({
        status: 'success',
        message: 'Đã xóa cấu trúc công việc thành công'
    });
});

module.exports = {
    createWbsItem,
    getProjectWbs,
    getWbsItem,
    updateWbsItem,
    deleteWbsItem
};