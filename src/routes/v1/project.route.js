const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const projectValidation = require('../../validations/project.validation');
const projectController = require('../../controllers/project.controller');
const wbsItemController = require('../../controllers/wbsItem.controller');
const wbsItemValidation = require('../../validations/wbsItem.validation');
const contractValidation = require('../../validations/contract.validation');
const contractController = require('../../controllers/contract.controller');
const acceptanceValidation = require('../../validations/acceptance.validation');
const acceptanceController = require('../../controllers/acceptance.controller');
const boqValidation = require('../../validations/boq.validation');
const boqController = require('../../controllers/boq.controller');
const materialReqValidation = require('../../validations/materialRequest.validation');
const materialReqController = require('../../controllers/materialRequest.controller');
const inventoryValidation = require('../../validations/inventory.validation');
const inventoryController = require('../../controllers/inventory.controller');

const router = express.Router();

router
    .route('/')
    .get(auth('getProjects'), validate(projectValidation.getProjects), projectController.getProjects)
    .post(auth('manageProjects'), validate(projectValidation.createProject), projectController.createProject);

router
    .route('/:projectId')
    .get(auth('getProjects'), validate(projectValidation.getProject), projectController.getProject)
    .patch(auth('manageProjects'), validate(projectValidation.updateProject), projectController.updateProject)
    .delete(auth('manageProjects'), validate(projectValidation.getProject), projectController.archiveProject);

router
    .route('/:projectId/members')
    .post(auth('manageProjects'), validate(projectValidation.addMember), projectController.addMember);

router
    .route('/:projectId/members/:userId')
    .delete(auth('manageProjects'), validate(projectValidation.removeMember), projectController.removeMember);

router
    .route('/:projectId/wbs')
    .get(auth('getProjects'), validate(wbsItemValidation.getProjectWbs), wbsItemController.getProjectWbs)
    .post(auth('manageWBS'), validate(wbsItemValidation.createWbsItem), wbsItemController.createWbsItem);

router
    .route('/:projectId/contracts')
    .get(auth('getContracts'), validate(contractValidation.getContracts), contractController.getContracts)
    .post(auth('manageContracts'), validate(contractValidation.createContract), contractController.createContract);

router
    .route('/:projectId/acceptance')
    .get(auth('getBOQ'), validate(acceptanceValidation.listAcceptance), acceptanceController.listAcceptance)
    .post(auth('manageAcceptance'), validate(acceptanceValidation.createAcceptance), acceptanceController.createAcceptance);

router
    .route('/:projectId/boq')
    .get(auth('getBOQ'), validate(boqValidation.listBoq), boqController.listBoq)
    .post(auth('manageBOQ'), validate(boqValidation.createBoq), boqController.createBoq);

router
    .route('/:projectId/boq/bulk')
    .post(auth('manageBOQ'), validate(boqValidation.bulkCreateBoq), boqController.bulkCreateBoq);

router.route('/:projectId/material-requests')
    .get(auth('getMaterials'), validate(materialReqValidation.list), materialReqController.list)
    .post(auth('manageMaterials'), validate(materialReqValidation.create), materialReqController.create);

router.route('/:projectId/inventory')
    .get(auth('getMaterials'), validate(inventoryValidation.list), inventoryController.listStocks);

router.route('/:projectId/inventory/transactions')
    .post(auth('manageInventory'), validate(inventoryValidation.createTxn), inventoryController.createTransaction)
    .get(auth('getMaterials'), validate(inventoryValidation.listTxn), inventoryController.listTransactions);

module.exports = router;