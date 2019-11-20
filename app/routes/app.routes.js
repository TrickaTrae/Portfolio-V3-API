module.exports = (app) => {
    const projects = require('../controllers/project.controller.js');
    const users = require("../controllers/user.controller.js");
    const userSessions = require("../controllers/userSession.controller.js");

    // project image handling
    const multer = require('multer');
    const multerS3 = require('multer-s3');
    const AWS = require('aws-sdk');

    AWS.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        region: 'us-west-1'
    })

    const s3 = new AWS.S3();
    const storage = multerS3({
        s3: s3,
        bucket: 'tw-portfolio-project-images',
        acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, {fieldName: file.originalname});
        },
        key: (req, file, cb) => {
            cb(null, Date.now().toString())
        }
    })
    const fileFilter = (req, file, cb) => {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null, true);
        } else {
            cb(new Error("image type must be jpeg or png"), false);
        }
    }
    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: 1024 * 1024 * 16 } // max filesize set to 16 mb
    });

    // projects
    app.post('/projects', upload.single('image'), projects.create);
    app.get('/projects', projects.findAll);
    app.put('/projects/:projectId', upload.single('image'), projects.update);
    app.delete('/projects/:projectId', projects.delete);

    // users
    app.post('/users/sign-up', users.create);

    // userSessions
    app.post('/users/sign-in', userSessions.create);
    app.get('/users/sign-out/:userSessionId', userSessions.findOne);
    app.get('/users/verifyUserSession/:userSessionId', userSessions.verifyUserSession);
}