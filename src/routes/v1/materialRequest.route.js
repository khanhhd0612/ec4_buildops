const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const materialReqValidation = require('../../validations/materialRequest.validation');
const materialReqController = require('../../controllers/materialRequest.controller');

const router = express.Router();

router.route('/:id')
    .get(auth('getMaterials'), validate(materialReqValidation.get), materialReqController.getById)
    .patch(auth('manageMaterials'), validate(materialReqValidation.update), materialReqController.update);

router.route('/:id/approve')
    .patch(auth('approveMaterials'), validate(materialReqValidation.approve), materialReqController.approve);

module.exports = router;
