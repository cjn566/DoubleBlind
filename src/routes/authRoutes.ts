import * as context from '../config/database'
let authRouter = require('express').Router();
import * as passport from 'passport';

let router = function(){
    authRouter.route('/signup')
        .post((req, res) =>{
            console.log(req.body);
            context.User({
                username: req.body.userName,
                password: req.body.password
            }).save().then((results)=>{

            }, (err)=>{
                console.error(err);
            })
        });

    authRouter.route('/login')
        .post(passport.authenticate('local',{
            failureRedirect: '/login.html'
        }), function(req, res){
            res.redirect('/auth/profile')
        });

    authRouter.route('/profile')
        .get((req, res)=>{
        res.json(req.user)
    });
    return authRouter;
};

module.exports = router;