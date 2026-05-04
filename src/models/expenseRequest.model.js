const { Schema, model } = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const expenseRequestSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        wbsItemId: { type: Schema.Types.ObjectId, ref: 'WBSItem' },

        code: { type: String, required: true, uppercase: true },
        title: { type: String, required: true },

        category: {
            type: String,
            enum: ['labor', 'material', 'equipment', 'transport', 'overhead', 'other'],
            required: true,
        },

        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'VND' },
        expenseDate: { type: Date, default: Date.now },

        vendor: String,    // Nhà cung cấp / người nhận tiền
        invoiceNo: String,    // Số hóa đơn
        invoiceDate: Date,
        description: String,

        status: {
            type: String,
            enum: ['draft', 'pending', 'approved', 'rejected', 'paid'],
            default: 'draft',
            index: true,
        },

        requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
        paidAt: Date,
        rejectionNote: String,

        files: [{ name: String, url: String, _id: false }],
        note: String,
    },
    { timestamps: true }
);

expenseRequestSchema.plugin(toJSON);
expenseRequestSchema.plugin(paginate);
expenseRequestSchema.index({ projectId: 1, category: 1 });
expenseRequestSchema.index({ projectId: 1, status: 1 });

const ExpenseRequest = model('ExpenseRequest', expenseRequestSchema);

module.exports = ExpenseRequest;