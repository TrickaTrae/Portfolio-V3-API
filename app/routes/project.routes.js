module.exports = (app) => {
    const projects = require('../controllers/project.controller.js');

    // image handling
    const multer = require('multer');
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
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
        limits: { fileSize: 1024 * 1024 * 8 } // max filesize set to 8 mb
    });

    app.post('/projects', upload.single('image'), projects.create);
    app.get('/projects', projects.findAll);
    app.get('/projects/:projectId', projects.findOne);
    app.put('/projects/:projectId', upload.single('image'), projects.update);
    app.delete('/projects/:projectId', projects.delete);
}