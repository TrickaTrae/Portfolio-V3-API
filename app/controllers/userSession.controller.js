const UserSession = require("../models/userSession.model.js");
const User = require("../models/user.model.js");

// create a new user session / sign in
exports.create = (req, res) => {
    if(!req.body.userName || !req.body.password) {
        return res.status(400).send({
            message: "Username and password required!"
        })
    } else {
        User.findOne({userName: req.body.userName}, (error, result) => {
            if(error){
                return res.status(400).send({
                    message: "Error: " + error
                })
            } else if(!result) {
                return res.status(400).send({
                    message: "Invalid User!"
                })
            } else if(result) {
                const userFound = result;
    
                if(!userFound.validPassword(req.body.password)) {
                    return res.status(400).send({
                        message: "Invalid Password!"
                    })
                } else if(userFound.isApproved === false){
                    return res.status(400).send({
                        message: "This account has not been approved yet!"
                    })
                } else {
                    const newUserSession = new UserSession({
                        userId: userFound._id
                    })
    
                    newUserSession.save().then(data => {
                        res.send({
                            success: true,
                            message: "Successfully signed in!",
                            data
                        });
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occured while signing the user in."
                        })
                    })
                }
            }
        })
    }
}

// "delete" / sign out of user session
exports.findOne = (req, res) => {
    UserSession.findOneAndUpdate({_id: req.params.userSessionId, isDeleted: false}, {$set: {isDeleted: true}}, {new: true}, (error, result) => {
        if(error) {
            return res.status(400).send({
                success: false,
                message: "Error: " + error
            })
        } else if (result) {
            if(result.isDeleted === true){
                return res.status(200).send({
                    success: true,
                    message: "Successfully signed out!"
                })
            } else {
                res.status(500).send({
                    success: false,
                    message: "Some error occurred while signing out."
                });
            }
        } else if(!result) {
            res.status(500).send({
                success: false,
                message: "Some error occurred while signing out."
            });
        }
    })
}

// verify user sign in / sessionId
exports.verifyUserSession = (req, res) => {
    UserSession.findOne({_id: req.params.userSessionId, isDeleted: false}, (error, result) => {
        if(error){
            return res.status(400).send({
                success: false,
                message: "Error: " + error
            })
        } else if(!error && !result){
            return res.status(400).send({
                success: false,
                message: "Invalid userSession!"
            })
        } else if(result){
            return res.status(200).send({
                success: true,
                message: "Valid userSession!"
            })
        }
    })
}