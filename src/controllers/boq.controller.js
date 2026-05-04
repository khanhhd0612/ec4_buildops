const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const boqService = require('../services/boq.service');

const listBoq = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['wbsItemId', 'contractId']);
    const options = pick(req.query, ['page', 'limit']);
    const result = await boqService.listBoq(req.params.projectId, filter, options);

    res.status(200).json({
        status: 'success',
        data: result,
    });
});

const createBoq = catchAsync(async (req, res) => {
    const item = await boqService.createBoq(req.params.projectId, req.body);
    res.status(201).json({
        status: 'success',
        message: 'Tạo hạng mục BOQ thành công',
        data: item,
    });
});

const bulkCreateBoq = catchAsync(async (req, res) => {
    const items = await boqService.bulkCreateBoq(req.params.projectId, req.body);
    res.status(201).json({
        status: 'success',
        message: 'Tạo nhiều hạng mục BOQ thành công',
        data: items,
    });
});

const updateBoq = catchAsync(async (req, res) => {
    const item = await boqService.updateBoqById(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        message: 'Cập nhật hạng mục BOQ thành công',
        data: item,
    });
});

const deleteBoq = catchAsync(async (req, res) => {
    await boqService.deleteBoqById(req.params.id);
    res.status(200).json({
        status: 'success',
        message: 'Xóa hạng mục BOQ thành công',
    });
});

module.exports = {
    listBoq,
    createBoq,
    bulkCreateBoq,
    updateBoq,
    deleteBoq,
};
