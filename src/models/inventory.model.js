const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const inventoryStockSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },

        qtyOnHand: { type: Number, default: 0 }, // Tồn kho hiện tại
        qtyReserved: { type: Number, default: 0 }, // Đã approved chờ xuất
        qtyAvailable: { type: Number, default: 0 },// auto: onHand - reserved

        lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        lastUpdatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

inventoryStockSchema.index({ projectId: 1, materialId: 1 }, { unique: true });

inventoryStockSchema.plugin(toJSON);
inventoryStockSchema.plugin(paginate);

inventoryStockSchema.pre('save', function (next) {
    this.qtyAvailable = Math.max(0, this.qtyOnHand - this.qtyReserved);
    next();
});

const InventoryStock = model('InventoryStock', inventoryStockSchema);

module.exports = InventoryStock;