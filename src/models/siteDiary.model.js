const { model, Schema } = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const diaryWorkItemSchema = new Schema(
    {
        wbsItemId: { type: Schema.Types.ObjectId, ref: 'WBSItem' },
        description: { type: String, required: true },
        location: String,       // Vị trí thi công
        qty: Number,
        unit: String,
        completionPct: Number,
        _id: false,
    }
);

const diaryLaborSchema = new Schema(
    {
        laborType: String,         // Thợ hồ, thợ sắt, công nhật...
        headcount: { type: Number, default: 0, min: 0 },
        hoursWorked: { type: Number, default: 8, min: 0 },
        note: String,
        _id: false,
    }
);

const diaryEquipmentSchema = new Schema(
    {
        equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment' },
        equipmentName: String,       // Snapshot
        hoursUsed: { type: Number, min: 0 },
        note: String,
        _id: false,
    }
);

const siteDiarySchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        diaryDate: { type: Date, required: true },

        weather: {
            type: String,
            enum: ['sunny', 'cloudy', 'rainy', 'storm', 'foggy'],
        },
        temperature: Number,        // °C
        workingHours: { type: Number, default: 8 },
        canWork: { type: Boolean, default: true },

        totalHeadcount: Number,      // Tổng nhân lực trong ngày

        // EMBED: chi tiết công việc, nhân lực, thiết bị
        workItems: [diaryWorkItemSchema],
        laborEntries: [diaryLaborSchema],
        equipmentEntries: [diaryEquipmentSchema],

        // EMBED: ảnh hiện trường
        photos: [{
            url: { type: String, required: true },
            publicId: String,
            caption: String,
            takenAt: Date,
            _id: false,
        }],

        notes: String,
        issues: String,              // Vấn đề phát sinh trong ngày

        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,

        status: {
            type: String,
            enum: ['draft', 'submitted', 'approved', 'rejected'],
            default: 'draft',
            index: true,
        },
        rejectionNote: String,
    },
    { timestamps: true }
);

siteDiarySchema.plugin(toJSON);
siteDiarySchema.plugin(paginate);
siteDiarySchema.index({ projectId: 1, diaryDate: -1 });
siteDiarySchema.index({ projectId: 1, createdBy: 1 });
siteDiarySchema.index({ projectId: 1, diaryDate: 1, createdBy: 1 }, { unique: true });

const SiteDiary = model('SiteDiary', siteDiarySchema);

module.exports = SiteDiary;