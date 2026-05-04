const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const v = require('../../validations/document.validation');
const c = require('../../controllers/document.controller');

const r = express.Router();

r.route('/projects/:projectId/folders')
    .get(auth('getDocuments'), validate(v.listFolders), c.listFolders)
    .post(auth('getDocuments'), validate(v.createFolder), c.createFolder);

r.route('/folders/:id')
    .patch(auth('manageDocuments'), validate(v.updateFolder), c.updateFolder)
    .delete(auth('manageDocuments'), validate(v.deleteFolder), c.deleteFolder);

r.route('/projects/:projectId/documents')
    .get(auth('getDocuments'), validate(v.listDocuments), c.listDocuments)
    .post(auth('manageDocuments'), validate(v.createDocument), c.createDocument);

r.route('/documents/:id')
    .patch(auth('getDocuments'), validate(v.updateDocument), c.updateDocument)
    .delete(auth('deleteDocuments'), validate(v.deleteDocument), c.deleteDocument);
    
module.exports = r;
