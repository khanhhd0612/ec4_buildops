const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const acceptanceItemSchema = new Schema(
    {
        boqItemId: { type: Schema.Types.ObjectId, ref: 'BOQItem', required: true },
        boqName: String,   // Snapshot tên hạng mục tại thời điểm nghiệm thu
        unit: String,   // Snapshot
        prevQty: { type: Number, default: 0 },     // Khối lượng các kỳ trước
        currentQty: { type: Number, required: true },  // Kỳ này
        totalQty: Number,                            // auto: prev + current
        unitPrice: { type: Number, required: true },
        amount: Number,                            // auto: currentQty × unitPrice
        _id: false,
    }
);

const acceptanceRecordSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
        wbsItemId: { type: Schema.Types.ObjectId, ref: 'WBSItem' },

        code: { type: String, required: true, uppercase: true },
        type: {
            type: String,
            enum: ['partial', 'final'],
            default: 'partial',
        },

        periodStart: { type: Date, required: true },
        periodEnd: { type: Date, required: true },

        items: [acceptanceItemSchema],

        totalValue: { type: Number, default: 0 },

        status: {
            type: String,
            enum: ['draft', 'submitted', 'approved', 'finalized', 'rejected'],
            default: 'draft',
            index: true,
        },

        submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        submittedAt: Date,
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
        finalizedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        finalizedAt: Date,
        rejectionNote: String,

        note: String,
        files: [{ name: String, url: String, _id: false }],
    },
    { timestamps: true }
);

acceptanceRecordSchema.plugin(toJSON);
acceptanceRecordSchema.plugin(paginate);

acceptanceRecordSchema.pre('save', function (next) {
    this.items.forEach(item => {
        item.totalQty = (item.prevQty || 0) + item.currentQty;
        item.amount = item.currentQty * item.unitPrice;
    });
    this.totalValue = this.items.reduce((sum, i) => sum + (i.amount || 0), 0);
    next();
});

const AcceptanceRecord = model('AcceptanceRecord', acceptanceRecordSchema);

module.exports = AcceptanceRecord;