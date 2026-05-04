const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const materialValidation = require('../../validations/material.validation');
const materialController = require('../../controllers/material.controller');

const router = express.Router();

router.route('/')
    .get(auth('getMaterials'), validate(materialValidation.getMaterials), materialController.getMaterials)
    .post(auth('manageMaterials'), validate(materialValidation.createMaterial), materialController.createMaterial);

router.route('/:id')
    .patch(auth('manageMaterials'), validate(materialValidation.updateMaterial), materialController.updateMaterial)
    .delete(auth('manageMaterials'), validate(materialValidation.deleteMaterial), materialController.deleteMaterial);

module.exports = router;
