const { model, Schema } = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const attendanceRecordSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        workDate: { type: Date, required: true },

        checkInTime: Date,
        checkOutTime: Date,
        hoursWorked: { type: Number, default: 0, min: 0, max: 24 },

        checkInLocation: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },

        photoUrl: String,
        type: {
            type: String,
            enum: ['regular', 'overtime', 'leave', 'absent'],
            default: 'regular',
        },

        dailyRate: { type: Number, min: 0 },
        totalAmount: { type: Number, min: 0 },

        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        note: String,
    },
    { timestamps: true }
);

attendanceRecordSchema.plugin(toJSON);
attendanceRecordSchema.plugin(paginate);
attendanceRecordSchema.index({ projectId: 1, workDate: -1 });
attendanceRecordSchema.index({ userId: 1, workDate: -1 });
attendanceRecordSchema.index({ checkInLocation: '2dsphere' });
attendanceRecordSchema.index({ projectId: 1, userId: 1, workDate: 1 }, { unique: true });

const AttendanceRecord = model('AttendanceRecord', attendanceRecordSchema);

module.exports = AttendanceRecord;