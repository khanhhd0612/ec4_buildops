const cloudinary = require('../config/cloudinary');

const deleteFile = async (publicId) => {
    if (!publicId) return null;
    return cloudinary.uploader.destroy(publicId);
};

module.exports = { deleteFile };
