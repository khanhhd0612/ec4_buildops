const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const v = require('../../validations/timesheet.validation');
const c = require('../../controllers/timesheet.controller');

const router = express.Router();

router.route('/projects/:projectId/employees')
    .get(auth('getEmployees'), validate(v.listEmployees), c.listEmployees)
    .post(auth('manageEmployees'), validate(v.addEmployee), c.addEmployee);

router.route('/employees/:projectId/:userId')
    .patch(auth('manageEmployees'), validate(v.updateEmployee), c.updateEmployee)
    .delete(auth('manageEmployees'), validate(v.removeEmployee), c.removeEmployee);

router.route('/projects/:projectId/timesheets')
    .get(auth('getTimesheets'), validate(v.listTimesheets), c.listTimesheets)
    .post(auth('manageTimesheets'), validate(v.createTimesheets), c.createTimesheets);

router.route('/timesheets/:id')
    .patch(auth('manageTimesheets'), validate(v.updateTimesheet), c.updateTimesheet);

router.route('/timesheets/:id/approve')
    .patch(auth('approveTimesheets'), validate(v.approveTimesheet), c.approveTimesheet);


module.exports = router;
