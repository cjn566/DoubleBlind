import * as context from '../config/database'
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
                    res.send("k");
                })
            }, (err)=>{
                if(err.code === "SQLITE_CONSTRAINT")
                    res.send("user not available");
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
                            res.send("k");
                        });
                    }
                    else { // Password mismatch
                        res.send("password invalid");
                    }
                } else { // username not found
                    res.send("user not exist");
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