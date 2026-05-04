const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const wbsItemValidation = require('../../validations/wbsItem.validation');
const wbsItemController = require('../../controllers/wbsItem.controller');
const progressValidation = require('../../validations/progressUpdate.validation');
const progressController = require('../../controllers/progressUpdate.controller');

const router = express.Router();

router
    .route('/:id')
    .get(auth('getProjects'), validate(wbsItemValidation.getWbsItem), wbsItemController.getWbsItem)
    .patch(auth('manageWBS'), validate(wbsItemValidation.updateWbsItem), wbsItemController.updateWbsItem)
    .delete(auth('manageWBS'), validate(wbsItemValidation.deleteWbsItem), wbsItemController.deleteWbsItem);

router
    .route('/:id/progress')
    .get(auth('getProjects'), (req, res, next) => {
        req.query.wbsItemId = req.params.id;
        next();
    }, validate(progressValidation.getProgressUpdates), progressController.getProgressUpdates)

    //Gửi báo cáo tiến độ mới
    .post(auth('updateProgress'), (req, res, next) => {
        req.body.wbsItemId = req.params.id; //Gắn cứng ID
        next();
    }, validate(progressValidation.createProgressUpdate), progressController.createProgressUpdate);

router
    .route('/:id/progress/:updateId/approve')
    .patch(auth('approveProgress'), validate(progressValidation.approveProgressUpdate), progressController.approveProgressUpdate);

module.exports = router;