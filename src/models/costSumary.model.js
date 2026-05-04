const { model, Schema } = require("mongoose");

const costSummarySchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        wbsItemId: { type: Schema.Types.ObjectId, ref: 'WBSItem' },

        period: { type: String, required: true }, // 'YYYY-MM'
        category: {
            type: String,
            enum: ['labor', 'material', 'equipment', 'transport', 'subcontract', 'overhead', 'other'],
        },

        plannedCost: { type: Number, default: 0 }, // Từ WBSItem.plannedCost
        committedCost: { type: Number, default: 0 }, // Từ Contract.value + MaterialRequest approved
        actualCost: { type: Number, default: 0 }, // Từ AcceptanceRecord + ExpenseRequest paid
        forecastCost: { type: Number, default: 0 }, // Dự báo chi phí hoàn thành (EAC)

        status: {
            type: String,
            enum: ['draft', 'approved'],
            default: 'draft',
        },

        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

costSummarySchema.index({ projectId: 1, period: 1, category: 1 }, { unique: true });

const CostSummary = model('CostSummary', costSummarySchema);

module.exports = CostSummary;