const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const v = require('../../validations/cost.validation');
const c = require('../../controllers/expense.controller');

const router = express.Router();

router.route('/projects/:projectId/expenses')
    .get(auth('getCosts'), validate(v.listExpenses), c.list)
    .post(auth('manageExpenses'), validate(v.createExpense), c.create);

router.route('/expenses/:id')
    .get(auth('getCosts'), validate(v.getExpense), c.getById)
    .patch(auth('manageExpenses'), validate(v.updateExpense), c.update);

router.route('/expenses/:id/approve')
    .patch(auth('approveExpenses'), validate(v.approveExpense), c.approve);

module.exports = router;
