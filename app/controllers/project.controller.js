const Project = require('../models/project.model.js');

// create and save a new project
exports.create = (req, res) => {
    const request = JSON.parse(req.body.formInput)

    if(!request.title || !request.description || !req.file) {
        return res.status(400).send({
            message: "Project title, description, and image can not be empty"
        });
    }

    const project = new Project({
        title: request.title, 
        description: request.description,
        tech: request.tech,
        site_link: request.site_link,
        code_link: request.code_link,
        image: req.file.path,
        filters: request.filters
    });

    project.save().then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the project."
        });
    });

};

// retrieve and return all projects from the db
exports.findAll = (req, res) => {

    Project.find()
    .then(projects => {
        res.send(projects);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
        });
    });

};

// find a single project with a id
exports.findOne = (req, res) => {
};

// update a project identified by the Id in the request
exports.update = (req, res) => {
    let request;
    let image;

    if(req.file === undefined){ // re-using old image
        request = req.body;
        image = req.body.image;
    } else { // a new image has been uploaded
        request = JSON.parse(req.body.formInput);
        image = req.file.path;
    }

    if(!request.title || !request.description) {
        return res.status(400).send({
            message: "Project title and description can not be empty"
        });
    }

    Project.findByIdAndUpdate(req.params.projectId, {
        title: request.title,
        description: request.description,
        tech: request.tech,
        site_link: request.site_link,
        code_link: request.code_link,
        image: image,
        filters: request.filters
    }, {new: true})
    .then(project => {
        if(!project) {
            return res.status(404).send({
                message: "Project not found with id " + req.params.projectId
            });
        }
        res.send(project);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Project not found with id " + req.params.projectId
            });                
        }
        return res.status(500).send({
            message: "Error updating project with id " + req.params.projectId
        });
    });

};

// delete a project with the specified Id in the request
exports.delete = (req, res) => {

    Project.findByIdAndRemove(req.params.projectId)
    .then(project => {
        if(!project) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.projectId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.projectId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.projectId
        });
    });

};