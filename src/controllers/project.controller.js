const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const projectService = require('../services/project.service');

const createProject = catchAsync(async (req, res) => {
    const project = await projectService.createProject(req.body, req.user.id);
    res.status(201).json({
        status: 'success',
        message: 'Tạo dự án thành công',
        data: project
    });
});

const getProjects = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['status', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    filter.isArchived = false;

    const result = await projectService.queryProjects(filter, options);
    res.status(200).json({
        status: 'success',
        data: result
    });
});

const getProject = catchAsync(async (req, res) => {
    const project = await projectService.getProjectById(req.params.projectId);
    res.status(200).json({
        status: 'success',
        data: project
    });
});

const updateProject = catchAsync(async (req, res) => {
    const project = await projectService.updateProjectById(req.params.projectId, req.body);
    res.status(200).json({
        status: 'success',
        message: 'Cập nhật dự án thành công',
        data: project
    });
});

const archiveProject = catchAsync(async (req, res) => {
    await projectService.archiveProjectById(req.params.projectId, req.user.id);
    res.status(200).json({
        status: 'success',
        message: 'Lưu trữ (Archive) dự án thành công'
    });
});

const addMember = catchAsync(async (req, res) => {
    const { userId, role } = req.body;
    const project = await projectService.addMember(req.params.projectId, userId, role);
    res.status(200).json({
        status: 'success',
        message: 'Thêm thành viên thành công',
        data: project.members
    });
});

const removeMember = catchAsync(async (req, res) => {
    const project = await projectService.removeMember(req.params.projectId, req.params.userId);
    res.status(200).json({
        status: 'success',
        message: 'Đã xóa thành viên khỏi dự án',
        data: project.members
    });
});

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    archiveProject,
    addMember,
    removeMember
};