const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const materialRequestItemSchema = new Schema(
    {
        materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
        materialName: String,           // Snapshot
        unit: String,           // Snapshot
        requestedQty: { type: Number, required: true, min: 0 },
        approvedQty: { type: Number, min: 0 },
        fulfilledQty: { type: Number, default: 0 },   // Đã xuất thực tế
        pendingQty: { type: Number, default: 0 },   // Còn chờ xuất (partial)
        unitPrice: { type: Number, min: 0 },       // Giá tham khảo
        note: String,
        _id: false,
    }
);

const materialRequestSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        wbsItemId: { type: Schema.Types.ObjectId, ref: 'WBSItem' },
        code: { type: String, required: true, uppercase: true },
        requestDate: { type: Date, default: Date.now },
        neededDate: Date,

        items: [materialRequestItemSchema],

        status: {
            type: String,
            enum: ['draft', 'pending', 'approved', 'partial', 'fulfilled', 'rejected', 'cancelled'],
            default: 'draft',
            index: true,
        },

        requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
        rejectionNote: String,
        note: String,
    },
    { timestamps: true }
);

materialRequestSchema.plugin(toJSON);
materialRequestSchema.plugin(paginate);
materialRequestSchema.index({ projectId: 1, status: 1 });

const MaterialRequest = model('MaterialRequest', materialRequestSchema);

module.exports = MaterialRequest;