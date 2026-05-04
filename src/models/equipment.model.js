const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const equipmentSchema = new Schema(
    {
        code: { type: String, required: true, uppercase: true, unique: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['vehicle', 'machinery', 'tool', 'scaffold', 'other'],
        },
        plateNo: String,        // Biển số xe
        brand: String,
        model: String,
        yearMade: Number,
        purchaseDate: Date,
        purchasePrice: { type: Number, min: 0 },

        status: {
            type: String,
            enum: ['available', 'in_use', 'maintenance', 'retired'],
            default: 'available',
            index: true,
        },

        // Dự án đang được phân công
        currentProjectId: { type: Schema.Types.ObjectId, ref: 'Project' },

        imageUrl: String,
        notes: String,
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

equipmentSchema.plugin(toJSON);
equipmentSchema.plugin(paginate);

const Equipment = model('Equipment', equipmentSchema);

module.exports = Equipment;