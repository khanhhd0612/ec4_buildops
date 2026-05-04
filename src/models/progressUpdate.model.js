const { Schema, model } = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const progressUpdateSchema = new Schema(
    {
        wbsItemId: { type: Schema.Types.ObjectId, ref: 'WBSItem', required: true, index: true },
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },

        reportDate: { type: Date, required: true },
        completedQty: { type: Number, default: 0 },
        completionPct: { type: Number, required: true, min: 0, max: 100 },

        note: String,
        issues: String,

        photos: [
            new Schema({
                url: {
                    type: String,
                    required: true,
                    validate: { validator: (v) => validator.isURL(v), message: 'URL ảnh không hợp lệ' }
                },
                caption: String,
                takenAt: { type: Date, default: Date.now },
            }, { _id: false })
        ],

        reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
        status: {
            type: String,
            enum: ['draft', 'submitted', 'approved', 'rejected'],
            default: 'submitted',
        },
    },
    { timestamps: true }
);

progressUpdateSchema.plugin(toJSON);
progressUpdateSchema.plugin(paginate);

progressUpdateSchema.index({ wbsItemId: 1, reportDate: -1 });
progressUpdateSchema.index({ projectId: 1, reportDate: -1 });
progressUpdateSchema.index({ projectId: 1, status: 1 });

progressUpdateSchema.index({ wbsItemId: 1, reportDate: 1 }, { unique: true });

module.exports = model('ProgressUpdate', progressUpdateSchema);