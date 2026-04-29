const { Schema, model } = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const organizationSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },

        type: {
            type: String,
            enum: ['contractor', 'subcontractor', 'pmu'],
            required: true,
            index: true,
        },

        plan: {
            type: String,
            enum: ['trial', 'starter', 'enterprise', 'private'],
            default: 'trial',
            index: true,
        },

        phone: {
            type: String,
            required: [true, 'Số điện thoại là bắt buộc'],
            validate(value) {
                if (!validator.isMobilePhone(value, 'vi-VN')) {
                    throw new Error('Số điện thoại không hợp lệ (Việt Nam)');
                }
            }
        },

        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email không hợp lệ.');
                }
            }
        },

        address: String,

        taxCode: {
            type: String,
            trim: true,
            validate: {
                validator: (v) => !v || validator.isAlphanumeric(v),
                message: 'Mã số thuế không hợp lệ',
            },
        },


        logoUrl: {
            type: String,
            validate: {
                validator: (v) => !v || validator.isURL(v),
                message: 'Logo URL không hợp lệ',
            },
        },

        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },

        memberCount: {
            type: Number,
            default: 0,
        },

        isActive: { type: Boolean, default: true },

        deletedAt: Date,
    },
    { timestamps: true }
);

organizationSchema.plugin(toJSON);
organizationSchema.plugin(paginate);

organizationSchema.index({ name: 'text' });

module.exports = model('Organization', organizationSchema);
