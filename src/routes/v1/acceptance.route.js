const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const acceptanceValidation = require('../../validations/acceptance.validation');
const acceptanceController = require('../../controllers/acceptance.controller');

const router = express.Router();

router
    .route('/:id')
    .get(auth('getBOQ'), validate(acceptanceValidation.getAcceptance), acceptanceController.getAcceptance)
    .patch(auth('manageAcceptance'), validate(acceptanceValidation.updateAcceptance), acceptanceController.updateAcceptance);

router
    .route('/:id/approve')
    .patch(auth('approveAcceptance'), validate(acceptanceValidation.approveAcceptance), acceptanceController.approveAcceptance);

module.exports = router;
