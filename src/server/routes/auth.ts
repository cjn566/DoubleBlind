import * as context from '../config/database'
import {LoginCode} from "../../common/interfaces/codes";
let authRouter = require('express').Router();

let router = function(){

    authRouter.route('/signup')
        .post((req, res, next) =>{
            console.log(req.body);
            new context.User({
                username: req.body.username,
                password: req.body.password
            }).save().then((results)=>{
                req.login({id: results.attributes.id}, (err) =>{
                    if(err) return next(err);
                    res.json(LoginCode.ok);
                })
            }, (err)=>{
                if(err.code === "SQLITE_CONSTRAINT")
                    res.json(LoginCode.userExist);
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
                            res.json(LoginCode.ok);
                        });
                    }
                    else { // Password mismatch
                        res.json(LoginCode.badPassword);
                    }
                } else { // username not found
                    res.json(LoginCode.noUser);
                }
            }).catch((err)=>{
                console.error(err);
                return next(err);
            });
        });

    authRouter.route('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
    return authRouter;
};

module.exports = router;