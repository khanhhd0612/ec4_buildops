const express = require('express');
const auth = require('../../middlewares/auth');
const cache = require('../../middlewares/cache');
const validate = require('../../middlewares/validate');
const v = require('../../validations/reports.validation');
const c = require('../../controllers/dashboard.controller');

const router = express.Router();

router.route('/summary')
    .get(auth('getReports'), cache(300, { isPrivate: true }), c.summary);

router.route('/alerts')
    .get(auth('getReports'), c.alerts);

router.route('/activities')
    .get(auth('getReports'), c.activities);

module.exports = router;
