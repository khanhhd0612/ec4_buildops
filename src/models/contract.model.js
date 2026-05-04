const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const appendixSchema = new Schema(
    {
        code: { type: String, required: true },
        description: String,
        value: { type: Number, default: 0 },
        signedDate: Date,
        files: [{
            name: String,
            url: String,
            _id: false,
        }],
    },
    { timestamps: true }
);

const paymentScheduleSchema = new Schema(
    {
        type: {
            type: String,
            enum: ['advance', 'progress', 'final', 'penalty'],
            required: true,
        },
        amount: { type: Number, required: true },
        dueDate: Date,
        paymentDate: Date,
        invoiceNo: String,
        note: String,
        status: {
            type: String,
            enum: ['pending', 'paid', 'overdue'],
            default: 'pending',
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const contractSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        code: { type: String, required: true, uppercase: true, trim: true },

        type: {
            type: String,
            enum: ['received', 'issued', 'labor', 'design', 'supervision'],
            required: true,
        },

        partyAName: { type: String, required: true },

        partyBName: { type: String, required: true },
        partyBTaxCode: String,
        partyBPhone: String,
        partyBEmail: String,

        value: { type: Number, required: true, min: 0 },
        vatRate: { type: Number, default: 10 },
        currency: { type: String, default: 'VND' },

        signedDate: Date,
        startDate: Date,
        endDate: Date,

        paymentTerms: String,

        status: {
            type: String,
            enum: ['draft', 'pending_sign', 'active', 'completed', 'terminated', 'disputed'],
            default: 'draft',
            index: true,
        },

        appendices: [appendixSchema],

        payments: [paymentScheduleSchema],

        files: [{
            name: String,
            url: String,
            _id: false,
        }],

        notes: String,
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

contractSchema.plugin(toJSON);
contractSchema.plugin(paginate);
contractSchema.index({ projectId: 1, code: 1 }, { unique: true });
contractSchema.index({ projectId: 1, type: 1 });

const Contract = model('Contract', contractSchema);

module.exports = Contract;