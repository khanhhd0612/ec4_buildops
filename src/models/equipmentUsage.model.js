const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const equipmentUsageLogSchema = new Schema(
    {
        equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        wbsItemId: { type: Schema.Types.ObjectId, ref: 'WBSItem' },

        logDate: { type: Date, required: true },
        hoursUsed: { type: Number, default: 0, min: 0 },
        fuelUsed: { type: Number, min: 0 },             // Lít nhiên liệu
        operatorId: { type: Schema.Types.ObjectId, ref: 'User' },
        note: String,
    },
    { timestamps: true }
);

equipmentUsageLogSchema.plugin(toJSON);
equipmentUsageLogSchema.index({ equipmentId: 1, logDate: -1 });

const EquipmentUsageLog = model('EquipmentUsageLog', equipmentUsageLogSchema);

module.exports = EquipmentUsageLog;