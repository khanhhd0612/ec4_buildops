const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const boqValidation = require('../../validations/boq.validation');
const boqController = require('../../controllers/boq.controller');

const router = express.Router();

router
    .route('/:id')
    .patch(auth('manageBOQ'), validate(boqValidation.updateBoq), boqController.updateBoq)
    .delete(auth('manageBOQ'), validate(boqValidation.deleteBoq), boqController.deleteBoq);

module.exports = router;
