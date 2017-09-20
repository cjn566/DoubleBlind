import * as context from '../config/database'
let authRouter = require('express').Router();
import * as passport from 'passport';

let router = function(){
    authRouter.route('/signup')
        .post((req, res) =>{
            console.log(req.body);
            new context.User({
                username: req.body.userName,
                password: req.body.password
            }).save().then((results)=>{
                req.login({id: results.attributes.id}, (err) =>{
                    return res.redirect('/profile');
                })
            }, (err)=>{
                console.error(err);
                res.send("Username taken.")
            })
        });

    authRouter.route('/login')
        .post(passport.authenticate('local',{
            failureRedirect: '/login.html',
            successRedirect: '/',
            failureFlash: true
        }));

    authRouter.route('/profile')
        .get((req, res)=>{
        res.json(req.user)
    });
    return authRouter;
};

module.exports = router;