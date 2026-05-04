const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const v = require('../../validations/cost.validation');
const c = require('../../controllers/cost.controller');

const r = express.Router();
r.route('/projects/:projectId/costs').get(auth('getCosts'), validate(v.listCosts), c.listCosts).post(auth('manageCosts'), validate(v.createCost), c.createCost);
r.route('/costs/:id').patch(auth('manageCosts'), validate(v.updateCost), c.updateCost);
r.route('/costs/:id/approve').patch(auth('approveCosts'), validate(v.approveCost), c.approveCost);
module.exports = r;
