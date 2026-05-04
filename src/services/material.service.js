const Material = require('../models/material.model');
const InventoryStock = require('../models/inventory.model');
const ApiError = require('../utils/ApiError');

const listMaterials = async (filter, options) => {
    const query = {};
    if (filter.category) query.category = filter.category;
    if (filter.isActive !== undefined) query.isActive = filter.isActive;
    if (filter.search) query.$text = { $search: filter.search };

    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const [results, totalResults] = await Promise.all([
        Material.find(query).sort(filter.search ? { score: { $meta: 'textScore' } } : { createdAt: -1 }).skip(skip).limit(limit),
        Material.countDocuments(query),
    ]);

    return { results, totalResults };
};

const createMaterial = async (body, userId) => {
    const exists = await Material.findOne({ code: body.code.toUpperCase() });
    if (exists) throw new ApiError(400, 'Mã vật tư đã tồn tại');
    const material = new Material({ ...body, createdBy: userId });
    return await material.save();
};

const updateMaterial = async (id, body) => {
    const material = await Material.findById(id);
    if (!material) throw new ApiError(404, 'Không tìm thấy vật tư');
    if (body.code && body.code.toUpperCase() !== material.code) {
        const exists = await Material.findOne({ code: body.code.toUpperCase(), _id: { $ne: id } });
        if (exists) throw new ApiError(400, 'Mã vật tư đã tồn tại');
    }
    Object.assign(material, body);
    return await material.save();
};

const deleteMaterial = async (id) => {
    const material = await Material.findById(id);
    if (!material) throw new ApiError(404, 'Không tìm thấy vật tư');
    const inStock = await InventoryStock.findOne({ materialId: id, $or: [{ qtyOnHand: { $gt: 0 } }, { qtyReserved: { $gt: 0 } }] });
    if (inStock) throw new ApiError(400, 'Không thể xóa vật tư đang còn tồn kho hoặc đã được giữ chỗ');
    await material.deleteOne();
    return material;
};

module.exports = { 
    listMaterials, 
    createMaterial, 
    updateMaterial, 
    deleteMaterial 
};
