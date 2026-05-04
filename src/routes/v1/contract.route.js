const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const contractValidation = require('../../validations/contract.validation');
const contractController = require('../../controllers/contract.controller');

const router = express.Router();

router
    .route('/:id')
    .get(auth('getContracts'), validate(contractValidation.getContract), contractController.getContract)
    .patch(auth('manageContracts'), validate(contractValidation.updateContract), contractController.updateContract)
    .delete(auth('manageContracts'), validate(contractValidation.deleteContract), contractController.deleteContract);

router
    .route('/:id/approve')
    .patch(auth('approveContracts'), validate(contractValidation.approveContract), contractController.approveContract);

router
    .route('/:id/appendices')
    .post(auth('manageContracts'), validate(contractValidation.addAppendix), contractController.addAppendix);

router
    .route('/:id/appendices/:appendixId')
    .patch(auth('manageContracts'), validate(contractValidation.updateAppendix), contractController.updateAppendix);

router
    .route('/:id/payments')
    .post(auth('manageContracts'), validate(contractValidation.addPayment), contractController.addPayment);

router
    .route('/:id/payments/:paymentId')
    .patch(auth('manageContracts'), validate(contractValidation.updatePayment), contractController.updatePayment);

module.exports = router;
