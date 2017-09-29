import * as context from '../config/database'
let authRouter = require('express').Router();

let router = function(){

    authRouter.route('/signup')
        .post((req, res) =>{
            console.log(req.body);
            new context.User({
                username: req.body.username,
                password: req.body.password
            }).save().then((results)=>{
                req.login({id: results.attributes.id}, (err) =>{
                    return res.send(req.body.destination);
                })
            }, (err)=>{
                if(err.code === "SQLITE_CONSTRAINT")
                    return res.status(401).send("user fail");
                console.error(err);
                return res.status(500).end();
            })
        });


    //TODO: Get the server to send the originally requested resource if login successful. If not successful, inidcate that to the client.


    authRouter.route('/login')
        .post((req, res, next) =>{
            let username = req.body.username;
            let password = req.body.password;
            context.User.where("username", username).fetch().then((UserModel)=>{
                if(UserModel) {
                    let result = UserModel.toJSON();
                    if (password === result.password) { // Successful login
                        req.login({id: result.id}, (err)=>{
                            if(err) return next(err);
                            //todo: redirect to original destination?
                            return res.send(req.body.destination);
                        });
                    }
                    else { // Password mismatch
                        return res.status(401).send("password fail");
                    }
                } else { // username not found
                    return res.status(401).send("user fail");
                }
            }).catch((err)=>{
                console.error(err);
                return next(err);
            });
        });

    return authRouter;
};

module.exports = router;