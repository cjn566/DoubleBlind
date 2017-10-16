import * as context from '../config/database'
import {Code} from '../js/interfaces/IauthCodes'
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
                    res.json(Code.ok);
                })
            }, (err)=>{
                if(err.code === "SQLITE_CONSTRAINT")
                    res.json(Code.userExist);
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
                            res.json(Code.ok);
                        });
                    }
                    else { // Password mismatch
                        res.json(Code.badPassword);
                    }
                } else { // username not found
                    res.json(Code.noUser);
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