const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const v = require('../../validations/siteDiary.validation');
const c = require('../../controllers/siteDiary.controller');
const router = express.Router();

router.route('/projects/:projectId/site-diaries')
    .get(auth('getProjects'), validate(v.listSiteDiaries), c.list)
    .post(auth('manageSiteDiary'), validate(v.createSiteDiary), c.create);

router.route('/site-diaries/:id')
    .get(auth('getProjects'), validate(v.getSiteDiary), c.getById)
    .patch(auth('manageSiteDiary'), validate(v.updateSiteDiary), c.update);

router.route('/site-diaries/:id/approve')
    .patch(auth('approveSiteDiary'), validate(v.approveSiteDiary), c.approve);

module.exports = router;
