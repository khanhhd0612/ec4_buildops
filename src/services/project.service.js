const Project = require('../models/project.model');
const ApiError = require('../utils/ApiError');

const checkCodeTaken = async (code, excludeProjectId = null) => {
    const project = await Project.findOne({
        code,
        _id: { $ne: excludeProjectId }
    });
    return !!project;
};

const createProject = async (projectBody, creatorId) => {
    if (await checkCodeTaken(projectBody.code)) {
        throw new ApiError(400, 'Mã dự án này đã tồn tại trên hệ thống');
    }

    const projectData = {
        ...projectBody,
        createdBy: creatorId,
        members: [{ userId: creatorId, role: 'owner' }]
    };

    return await Project.create(projectData);
};

const queryProjects = async (filter, options) => {
    return await Project.paginate(filter, options);
};

const getProjectById = async (id) => {
    const project = await Project.findById(id)
        .populate({
            path: 'members.userId',
            select: 'firstName lastName email role'
        });
    if (!project) {
        throw new ApiError(404, 'Dự án không tồn tại');
    }
    return project;
};

const updateProjectById = async (projectId, updateBody) => {
    const project = await getProjectById(projectId);

    if (updateBody.code && await checkCodeTaken(updateBody.code, projectId)) {
        throw new ApiError(400, 'Mã dự án này đã tồn tại trên hệ thống');
    }

    Object.assign(project, updateBody);
    await project.save();
    return project;
};

const archiveProjectById = async (projectId, userId) => {
    const project = await getProjectById(projectId);

    project.isArchived = true;
    project.archivedAt = new Date();
    project.archivedBy = userId;

    await project.save();
    return project;
};

const addMember = async (projectId, userId, role) => {
    const project = await getProjectById(projectId);

    const isMemberExist = project.members.some(
        (member) => member.userId.toString() === userId.toString()
    );

    if (isMemberExist) {
        throw new ApiError(400, 'Người dùng này đã là thành viên của dự án');
    }

    project.members.push({ userId, role });
    await project.save();
    return project;
};

const removeMember = async (projectId, userId) => {
    const project = await getProjectById(projectId);

    const initialLength = project.members.length;
    project.members = project.members.filter(
        (member) => member.userId.toString() !== userId.toString()
    );

    if (project.members.length === initialLength) {
        throw new ApiError(404, 'Thành viên không tồn tại trong dự án');
    }

    await project.save();
    return project;
};

module.exports = {
    createProject,
    queryProjects,
    getProjectById,
    updateProjectById,
    archiveProjectById,
    addMember,
    removeMember
};