const Project = require('../models/project.model.js');
const AWS = require('aws-sdk');

AWS.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'us-west-1'
})

// create and save a new project
exports.create = (req, res) => {
    const request = JSON.parse(req.body.formInput)

    if(!request.title || !request.description || !req.file) {
        return res.status(400).send({
            message: "Project title, description, and image can not be empty"
        });
    } else {
        const project = new Project({
            title: request.title, 
            description: request.description,
            tech: request.tech,
            site_link: request.site_link,
            code_link: request.code_link,
            image: req.file.location,
            imageS3Key: req.file.key,
            filters: request.filters,
            disabled: true
        });
    
        project.save().then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the project."
            });
        });
    }

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

// update a project identified by the Id in the request
exports.update = (req, res) => {
    if(req.file === undefined) {
        // re-using old image

        const projectId = req.params.projectId;
        const request = req.body;
        const image = req.body.image;

        if(!request.title || !request.description) {
            return res.status(400).send({
                message: "Project title and description can not be empty"
            });
        } else {
            Project.findByIdAndUpdate(projectId, {
                title: request.title,
                description: request.description,
                tech: request.tech,
                site_link: request.site_link,
                code_link: request.code_link,
                image: image,
                filters: request.filters,
                disabled: request.disabled
            }, {new: true})
            .then(project => {
                if(!project) {
                    return res.status(404).send({
                        message: "Project not found with id " + projectId
                    });
                }
                res.send(project);
            }).catch(err => {
                return res.status(500).send({
                    message: "Error updating project: " + err
                });
            });
        }

    } else {
        // updating with a new image

        const projectId = req.params.projectId;
        const request = JSON.parse(req.body.formInput);
        const image = req.file.location;

        if(!request.title || !request.description) {
            return res.status(400).send({
                message: "Project title and description can not be empty"
            });
        } else {
            // first delete old image from aws s3
            Project.findOne({ _id: projectId }, (error, result) => {
                if(result) {
                    // delete image from aws s3
                    const s3 = new AWS.S3();
                    s3.deleteObject({
                        Bucket: 'tw-portfolio-project-images',
                        Key: result.imageS3Key
                    }, (err) => {
                        if(err){
                            console.log("error while trying to delete image from aws s3: ", err);
                        } else {
                            console.log("successfully deleted image from aws s3!");
                        }
                    })
                } else {
                    return res.status(400).send({
                        message: "Error: " + error
                    })
                }
            }).then(() => {
                // then update project with new image and key
                Project.findByIdAndUpdate(projectId, {
                    title: request.title,
                    description: request.description,
                    tech: request.tech,
                    site_link: request.site_link,
                    code_link: request.code_link,
                    image: image,
                    imageS3Key: req.file.key,
                    filters: request.filters,
                    disabled: request.disabled
                }, {new: true})
                .then(project => {
                    if(!project) {
                        return res.status(404).send({
                            message: "Project not found with id " + req.params.projectId
                        });
                    }
                    res.send(project);
                }).catch(err => {
                    return res.status(500).send({
                        message: "Error updating project: " + err
                    });
                });
            })
        }

    }
};

// delete a project with the specified Id in the request
exports.delete = (req, res) => {
    Project.findOne({ _id: req.params.projectId }).then(project => {
        if(!project) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.projectId
            });
        } else {
            // delete image from aws s3
            const s3 = new AWS.S3();
            s3.deleteObject({
                Bucket: 'tw-portfolio-project-images',
                Key: project.imageS3Key
            }, (err) => {
                if(err){
                    console.log("error while trying to delete image from aws s3: ", err);
                } else {
                    console.log("successfully deleted image from aws s3!");
                }
            })
    
            // delete project from db
            Project.deleteOne({ _id: project._id }, (error, result) => {
                if(!error && result.ok){
                    res.send({message: "Note deleted successfully!"});
                } else {
                    return res.status(500).send({
                        message: "An error occured while trying to delete project: " + error
                    });
                }
            })
        }
    })
};