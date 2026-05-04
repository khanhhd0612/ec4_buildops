const { model, Schema } = require("mongoose");
const { toJSON } = require("./plugins");

const documentFolderSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        parentId: { type: Schema.Types.ObjectId, ref: 'DocumentFolder', default: null }, // null = root
        name: { type: String, required: true, trim: true },
        sortOrder: { type: Number, default: 0 },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

documentFolderSchema.plugin(toJSON);
documentFolderSchema.index({ projectId: 1, parentId: 1 });

const DocumentFolder = model('DocumentFolder', documentFolderSchema);

module.exports = DocumentFolder;