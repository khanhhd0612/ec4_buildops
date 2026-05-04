const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const contractService = require('../services/contract.service');

const createContract = catchAsync(async (req, res) => {
    const contract = await contractService.createContract(req.params.projectId, req.body, req.user.id);
    res.status(201).json({
        status: 'success',
        message: 'Tạo hợp đồng thành công',
        data: contract,
    });
});

const getContracts = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['type', 'status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await contractService.queryContracts(req.params.projectId, filter, options);
    res.status(200).json({
        status: 'success',
        data: result
    });
});

const getContract = catchAsync(async (req, res) => {
    const contract = await contractService.getContractById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: contract,
    });
});

const updateContract = catchAsync(async (req, res) => {
    const contract = await contractService.updateContractById(req.params.id, req.body, req.user.role);
    res.status(200).json({
        status: 'success',
        message: 'Cập nhật hợp đồng thành công',
        data: contract,
    });
});

const approveContract = catchAsync(async (req, res) => {
    const contract = await contractService.approveContract(req.params.id, req.body.action, req.body.note, req.user.id);
    res.status(200).json({
        status: 'success',
        message: req.body.action === 'approve' ? 'Duyệt hợp đồng thành công' : 'Từ chối hợp đồng thành công',
        data: contract,
    });
});

const deleteContract = catchAsync(async (req, res) => {
    await contractService.deleteContract(req.params.id);
    res.status(200).json({
        status: 'success',
        message: 'Xóa hợp đồng thành công',
    });
});

const addAppendix = catchAsync(async (req, res) => {
    const contract = await contractService.addAppendix(req.params.id, req.body);
    res.status(201).json({
        status: 'success',
        message: 'Thêm phụ lục thành công',
        data: contract,
    });
});

const updateAppendix = catchAsync(async (req, res) => {
    const contract = await contractService.updateAppendix(req.params.id, req.params.appendixId, req.body);
    res.status(200).json({
        status: 'success',
        message: 'Cập nhật phụ lục thành công',
        data: contract,
    });
});

const addPayment = catchAsync(async (req, res) => {
    const contract = await contractService.addPayment(req.params.id, req.body, req.user.id);
    res.status(201).json({
        status: 'success',
        message: 'Thêm đợt thanh toán thành công',
        data: contract,
    });
});

const updatePayment = catchAsync(async (req, res) => {
    const contract = await contractService.updatePayment(req.params.id, req.params.paymentId, req.body, req.user.id);
    res.status(200).json({
        status: 'success',
        message: 'Cập nhật thanh toán thành công',
        data: contract,
    });
});

module.exports = {
    createContract,
    getContracts,
    getContract,
    updateContract,
    approveContract,
    deleteContract,
    addAppendix,
    updateAppendix,
    addPayment,
    updatePayment,
};
