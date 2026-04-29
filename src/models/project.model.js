const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

//Member
const projectMemberSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        role: {
            type: String,
            enum: ['owner', 'pm', 'engineer', 'supervisor', 'warehouse', 'viewer'],
            default: 'viewer',
        },

        joinedAt: { type: Date, default: Date.now },

    },
    { _id: false }
);

//Location
const locationSchema = new Schema(
    {
        address: String,
        province: String,
        district: String,
        ward: String,

        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    { _id: false }
);

//Project
const projectSchema = new Schema(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
            index: true,
        },

        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            validate: {
                validator: (v) => validator.isAlphanumeric(v.replace(/[-_]/g, '')),
                message: 'Code chỉ được chứa chữ, số, - hoặc _',
            },
        },

        name: { type: String, required: true, trim: true },

        type: {
            type: String,
            enum: ['construction', 'mep', 'interior', 'infrastructure', 'industrial'],
        },

        status: {
            type: String,
            enum: ['planning', 'in_progress', 'paused', 'completed', 'closed'],
            default: 'planning',
            index: true,
        },

        //Quan hệ (chuẩn hóa ObjectId)
        ownerId: { type: Schema.Types.ObjectId, ref: 'Organization' },
        mainContractorId: { type: Schema.Types.ObjectId, ref: 'Organization' },
        consultantId: { type: Schema.Types.ObjectId, ref: 'Organization' },

        //Location
        location: locationSchema,

        //Timeline
        startDate: Date,
        endDate: Date,
        actualEndDate: Date,

        //Financial
        currency: {
            type: String,
            default: 'VND',
            validate: {
                validator: (v) => validator.isISO4217(v),
                message: 'Currency không hợp lệ',
            },
        },

        totalBudget: { type: Number, default: 0 },
        contractValue: { type: Number, default: 0 },

        //tránh sai lệch
        progressPct: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
            select: false,
        },

        area: Number,
        floors: Number,

        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high'],
        },

        tags: [String],

        description: String,
        coverImageUrl: {
            type: String,
            validate: {
                validator: (v) => !v || validator.isURL(v),
                message: 'Cover image URL không hợp lệ',
            },
        },

        members: [projectMemberSchema],

        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },

        isArchived: { type: Boolean, default: false },
        archivedAt: Date,
        archivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

projectSchema.plugin(toJSON);
projectSchema.plugin(paginate);

projectSchema.index({ orgId: 1, code: 1 }, { unique: true });
projectSchema.index({ orgId: 1, status: 1 });
projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ name: 'text' });

projectSchema.pre('save', function (next) {
    if (this.endDate && this.startDate && this.endDate < this.startDate) {
        return next(new Error('endDate phải lớn hơn startDate'));
    }
    next();
});

module.exports = model('Project', projectSchema);
