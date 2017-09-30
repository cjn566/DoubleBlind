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
                    res.clearCookie('oDest');
                    respond(res, null, req.cookies.oDest || "/");
                })
            }, (err)=>{
                if(err.code === "SQLITE_CONSTRAINT")
                    respond(res, "user fail", null);
                console.error(err);
                return res.status(500).end();
            })
        });

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
                            res.clearCookie('oDest');
                            respond(res, null, req.cookies.oDest || "/");
                        });
                    }
                    else { // Password mismatch
                        respond(res, "password fail", null);
                    }
                } else { // username not found
                    respond(res, "user fail", null);
                }
            }).catch((err)=>{
                console.error(err);
                return next(err);
            });
        });

    let respond = (res, err, destination) =>{
        return res.json({
            err: err,
            destination: destination
        });
    }

    return authRouter;
};

module.exports = router;