const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const materialSchema = new Schema(
    {
        code: { type: String, required: true, uppercase: true, trim: true, unique: true },
        name: { type: String, required: true, trim: true },
        unit: { type: String, required: true },     // m², m³, kg, cái, cuộn...
        category: { type: String, trim: true },          // Nhóm vật tư: Xi măng, Sắt thép, Điện...
        spec: String,                                // Quy cách kỹ thuật
        brand: String,                                // Nhãn hiệu
        imageUrl: {
            type: String,
            validate: {
                validator: v => !v || validator.isURL(v),
                message: 'URL ảnh không hợp lệ',
            },
        },
        referencePrice: { type: Number, min: 0 },        // Giá tham khảo thị trường
        isActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

materialSchema.plugin(toJSON);
materialSchema.plugin(paginate);
materialSchema.index({ name: 'text', code: 'text' }); // Full-text search

const Material = model('Material', materialSchema);

module.exports = Material;