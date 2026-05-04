const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const equipmentValidation = require('../../validations/equipment.validation');
const equipmentController = require('../../controllers/equipment.controller');

const router = express.Router();

router.route('/')
    .get(auth('getEquipment'), validate(equipmentValidation.getEquipment), equipmentController.list)
    .post(auth('manageEquipment'), validate(equipmentValidation.createEquipment), equipmentController.create);

router.route('/:id')
    .get(auth('getEquipment'), validate(equipmentValidation.getById), equipmentController.getById)
    .patch(auth('manageEquipment'), validate(equipmentValidation.updateEquipment), equipmentController.update)
    .delete(auth('manageEquipment'), validate(equipmentValidation.deleteEquipment), equipmentController.remove);

router.route('/:id/assign')
    .post(auth('manageEquipment'), validate(equipmentValidation.assignEquipment), equipmentController.assign);

router.route('/:id/logs')
    .post(auth('manageEquipmentLog'), validate(equipmentValidation.createLog), equipmentController.createLog)
    .get(auth('getEquipment'), validate(equipmentValidation.listLogs), equipmentController.listLogs);

module.exports = router;
