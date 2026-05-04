const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const transactionItemSchema = new Schema(
    {
        materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
        materialName: String,   // Snapshot
        unit: String,   // Snapshot
        qty: { type: Number, required: true, min: 0 },
        unitPrice: { type: Number, min: 0 },
        totalPrice: { type: Number, default: 0 }, // auto: qty × unitPrice
        lotNo: String,   // Số lô hàng
        note: String,
        _id: false,
    }
);

const inventoryTransactionSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },

        type: {
            type: String,
            enum: ['import', 'export', 'transfer', 'adjust', 'return'],
            required: true,
        },

        code: { type: String, required: true, uppercase: true },
        transactionDate: { type: Date, default: Date.now },

        // Nguồn gốc phiếu
        refType: {
            type: String,
            enum: ['material_request', 'purchase_order', 'return', 'manual'],
        },
        refId: { type: Schema.Types.ObjectId },

        items: [transactionItemSchema],

        totalValue: { type: Number, default: 0 }, // auto: sum(items.totalPrice)
        transactedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        note: String,
        files: [{ name: String, url: String, _id: false }],
    },
    { timestamps: true }
);

inventoryTransactionSchema.plugin(toJSON);
inventoryTransactionSchema.plugin(paginate);
inventoryTransactionSchema.index({ projectId: 1, type: 1, transactionDate: -1 });

inventoryTransactionSchema.pre('save', function (next) {
    this.items.forEach(item => {
        item.totalPrice = (item.qty || 0) * (item.unitPrice || 0);
    });
    this.totalValue = this.items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
    next();
});

const InventoryTransaction = model('InventoryTransaction', inventoryTransactionSchema);

module.exports = InventoryTransaction;