const mongoose = require('mongoose');

const ProjectSchema = mongoose.Schema({
    title: String,
    description: String,
    tech: String,
    site_link: String,
    code_link: String,
    image: String,
    imageS3Key: String,
    filters: String,
    disabled: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);