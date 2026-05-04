const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const materialService = require('../services/material.service');

const getMaterials = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['category', 'search']);
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true' || req.query.isActive === true;
    const options = pick(req.query, ['page', 'limit']);

    const result = await materialService.listMaterials(filter, options);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

const createMaterial = catchAsync(async (req, res) => {
    const material = await materialService.createMaterial(req.body, req.user.id);

    res.status(201).json({
        status: 'success',
        message: 'Tạo vật tư thành công',
        data: material
    });
});

const updateMaterial = catchAsync(async (req, res) => {
    const material = await materialService.updateMaterial(req.params.id, req.body);

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật vật tư thành công',
        data: material
    });
});

const deleteMaterial = catchAsync(async (req, res) => {
    await materialService.deleteMaterial(req.params.id);
    res.status(200).json({
        status: 'success',
        message: 'Xóa vật tư thành công'
    });
});

module.exports = {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial
};
