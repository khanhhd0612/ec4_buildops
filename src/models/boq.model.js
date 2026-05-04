const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const boqItemSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        wbsItemId: { type: Schema.Types.ObjectId, ref: 'WBSItem' },
        contractId: { type: Schema.Types.ObjectId, ref: 'Contract' },

        code: { type: String, trim: true },
        name: { type: String, required: true, trim: true },
        unit: { type: String, required: true },

        plannedQty: { type: Number, required: true, min: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, default: 0 },

        acceptedQty: { type: Number, default: 0 },
        remainingQty: { type: Number, default: 0 },
        isOverrun: { type: Boolean, default: false },
        overrunQty: { type: Number, default: 0 },

        description: String,
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

boqItemSchema.plugin(toJSON);
boqItemSchema.plugin(paginate);
boqItemSchema.index({ projectId: 1, wbsItemId: 1 });

boqItemSchema.pre('save', function (next) {
    this.totalPrice = this.plannedQty * this.unitPrice;
    this.remainingQty = this.plannedQty - this.acceptedQty;
    this.isOverrun = this.acceptedQty > this.plannedQty;
    this.overrunQty = this.isOverrun ? this.acceptedQty - this.plannedQty : 0;
    next();
});

const BOQItem = model('BOQItem', boqItemSchema);

module.exports = BOQItem;