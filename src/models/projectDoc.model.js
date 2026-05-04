const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const projectDocumentSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        folderId: { type: Schema.Types.ObjectId, ref: 'DocumentFolder', default: null },

        name: { type: String, required: true, trim: true },
        fileUrl: { type: String, required: true },
        publicId: String,            // Cloudinary public_id
        fileSize: Number,            // bytes
        mimeType: String,            // image/jpeg, application/pdf...
        version: { type: Number, default: 1 },

        category: {
            type: String,
            enum: ['drawing', 'contract', 'permit', 'report', 'photo', 'spec', 'other'],
        },
        tags: [String],
        isArchived: { type: Boolean, default: false },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

projectDocumentSchema.plugin(toJSON);
projectDocumentSchema.plugin(paginate);
projectDocumentSchema.index({ projectId: 1, folderId: 1 });
projectDocumentSchema.index({ projectId: 1, tags: 1 });
projectDocumentSchema.index({ name: 'text' });

const ProjectDocument = model('ProjectDocument', projectDocumentSchema);

module.exports = ProjectDocument;