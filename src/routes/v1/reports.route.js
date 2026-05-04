const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const v = require('../../validations/reports.validation');
const c = require('../../controllers/reports.controller');

const router = express.Router();

router.route('/projects/:projectId/reports/progress')
    .get(auth('getProjects'), validate(v.progressReport), c.getProgress);

router.route('/projects/:projectId/reports/cost')
    .get(auth('getCosts'), validate(v.costReport), c.getCost);

router.route('/projects/:projectId/reports/material')
    .get(auth('getMaterials'), validate(v.materialReport), c.getMaterial);

router.route('/projects/:projectId/reports/attendance')
    .get(auth('getTimesheets'), validate(v.attendanceReport), c.getAttendance);

router.route('/projects/:projectId/reports/export')
    .get(auth('getReports'), validate(v.exportReport), c.exportReport);

router.route('/projects/:projectId/insight')
    .get(auth('getInsight'), validate(v.insight), c.getInsight);

module.exports = router;
