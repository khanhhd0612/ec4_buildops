const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const dependencySchema = new Schema(
    {
        predecessorId: { type: Schema.Types.ObjectId, ref: 'WBSItem', required: true },
        type: { type: String, enum: ['FS', 'SS', 'FF', 'SF'], default: 'FS' }, // FS: Finish-to-Start, SS: Start-to-Start...
        lagDays: { type: Number, default: 0 },
    },
    { _id: false }
);

const wbsItemSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        parentId: { type: Schema.Types.ObjectId, ref: 'WBSItem', default: null, index: true }, // null = root level

        // Tree Structure
        treeCode: { type: String, index: true },
        level: { type: Number, default: 0 },
        isLeaf: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },

        code: { type: String, trim: true },
        name: { type: String, required: true, trim: true },
        unit: { type: String, trim: true },
        description: { type: String, default: '' },

        // Kế hoạch (Planned)
        plannedStart: Date,
        plannedEnd: Date,
        plannedQty: { type: Number, min: 0 },
        plannedCost: { type: Number, default: 0, min: 0 },
        weightPct: { type: Number, default: 0, min: 0, max: 100 },

        // Thực tế (Actual)
        actualStart: Date,
        actualEnd: Date,
        actualQty: { type: Number, default: 0, min: 0 },
        actualCost: { type: Number, default: 0, min: 0 },
        completionPct: { type: Number, default: 0, min: 0, max: 100 },

        // Trạng thái & Phân công
        status: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'delayed', 'paused'],
            default: 'not_started',
            index: true,
        },
        assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        dependencies: [dependencySchema],
        notes: String,

        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

wbsItemSchema.plugin(toJSON);
wbsItemSchema.plugin(paginate);

wbsItemSchema.index({ projectId: 1, treeCode: 1 });
wbsItemSchema.index({ projectId: 1, sortOrder: 1 });
wbsItemSchema.index({ projectId: 1, code: 1 }, { unique: true, sparse: true });

wbsItemSchema.virtual('isOverdue').get(function () {
    if (this.status === 'completed') return false;
    if (!this.plannedEnd) return false;
    return new Date() > this.plannedEnd;
});

wbsItemSchema.pre('save', function (next) {
    if (this.plannedStart && this.plannedEnd && this.plannedEnd < this.plannedStart) {
        return next(new Error('Ngày kết thúc kế hoạch (plannedEnd) phải lớn hơn hoặc bằng ngày bắt đầu'));
    }

    if (this.actualStart && this.actualEnd && this.actualEnd < this.actualStart) {
        return next(new Error('Ngày kết thúc thực tế (actualEnd) phải lớn hơn hoặc bằng ngày bắt đầu'));
    }

    if (this.completionPct === 100 && this.status !== 'completed') {
        this.status = 'completed';
        if (!this.actualEnd) this.actualEnd = new Date();
    }

    next();
});

module.exports = model('WBSItem', wbsItemSchema);