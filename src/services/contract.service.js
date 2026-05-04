const Contract = require('../models/contract.model');
const Project = require('../models/project.model');
const ApiError = require('../utils/ApiError');

const getProjectOrThrow = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, 'Dự án không tồn tại');
    }
    return project;
};

const getContractOrThrow = async (contractId) => {
    const contract = await Contract.findById(contractId)
        .populate('createdBy', 'firstName lastName email role')
        .populate('payments.approvedBy', 'firstName lastName email role');

    if (!contract) {
        throw new ApiError(404, 'Hợp đồng không tồn tại');
    }

    return contract;
};

const isCodeTaken = async (projectId, code, excludeContractId = null) => {
    const existing = await Contract.findOne({
        projectId,
        code: code.toUpperCase(),
        _id: { $ne: excludeContractId },
    });
    return !!existing;
};

const createContract = async (projectId, body, creatorId) => {
    await getProjectOrThrow(projectId);

    if (await isCodeTaken(projectId, body.code)) {
        throw new ApiError(400, 'Mã hợp đồng đã tồn tại trong dự án này');
    }

    const contract = await Contract.create({
        ...body,
        projectId,
        code: body.code.toUpperCase(),
        status: 'draft',
        createdBy: creatorId,
    });

    return contract;
};

const queryContracts = async (projectId, filter, options) => {
    await getProjectOrThrow(projectId);

    const query = { projectId, ...filter };

    return await Contract.paginate(query, options);
};

const getContractById = async (contractId) => {
    return getContractOrThrow(contractId);
};

const updateContractById = async (contractId, updateBody, userRole) => {
    const contract = await getContractOrThrow(contractId);

    if (contract.status === 'active' && userRole !== 'admin') {
        throw new ApiError(403, 'Không thể chỉnh sửa hợp đồng đang ở trạng thái active');
    }

    if (updateBody.code && await isCodeTaken(contract.projectId, updateBody.code, contractId)) {
        throw new ApiError(400, 'Mã hợp đồng đã tồn tại trong dự án này');
    }

    Object.assign(contract, {
        ...updateBody,
        ...(updateBody.code ? { code: updateBody.code.toUpperCase() } : {}),
    });

    await contract.save();
    return contract;
};

const approveContract = async (contractId, action, note, userId) => {
    const contract = await getContractOrThrow(contractId);

    contract.approvalNote = note;
    contract.approvedBy = userId;
    contract.approvedAt = new Date();

    if (action === 'approve') {
        contract.status = 'active';
    } else {
        contract.status = 'draft';
    }

    await contract.save();
    return contract;
};

const deleteContract = async (contractId) => {
    const contract = await getContractOrThrow(contractId);

    if (contract.status !== 'draft') {
        throw new ApiError(400, 'Chỉ có thể xóa hợp đồng ở trạng thái draft');
    }

    await contract.deleteOne();
};

const addAppendix = async (contractId, appendixBody) => {
    const contract = await getContractOrThrow(contractId);
    contract.appendices.push(appendixBody);
    await contract.save();
    return contract;
};

const updateAppendix = async (contractId, appendixId, updateBody) => {
    const contract = await getContractOrThrow(contractId);
    const appendix = contract.appendices.id(appendixId);

    if (!appendix) {
        throw new ApiError(404, 'Phụ lục không tồn tại');
    }

    Object.assign(appendix, updateBody);
    await contract.save();
    return contract;
};

const addPayment = async (contractId, paymentBody, userId) => {
    const contract = await getContractOrThrow(contractId);
    contract.payments.push({
        ...paymentBody,
        approvedBy: userId,
    });
    await contract.save();
    return contract;
};

const updatePayment = async (contractId, paymentId, updateBody, userId) => {
    const contract = await getContractOrThrow(contractId);
    const payment = contract.payments.id(paymentId);

    if (!payment) {
        throw new ApiError(404, 'Đợt thanh toán không tồn tại');
    }

    const nextBody = { ...updateBody };
    if (nextBody.status === 'paid') {
        nextBody.paymentDate = new Date();
    }

    Object.assign(payment, nextBody);
    payment.approvedBy = userId;

    await contract.save();
    return contract;
};

module.exports = {
    createContract,
    queryContracts,
    getContractById,
    updateContractById,
    approveContract,
    deleteContract,
    addAppendix,
    updateAppendix,
    addPayment,
    updatePayment,
};
