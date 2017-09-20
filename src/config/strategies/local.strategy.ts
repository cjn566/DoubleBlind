let pp = require('passport');
import * as context from '../database'
let LocalStrategy = require('passport-local').Strategy;

module.exports = function(){
    pp.use(new LocalStrategy({
        usernameField: 'userName',
        passwordField: 'password'
    }, function(username, password, done){
        context.User.where("username", username).fetch().then((UserModel)=>{
            if(UserModel) {
                let result = UserModel.toJSON();
                if (password === result.password) {
                    done(null, result);
                }
                else {
                    done(null, false, {message: "Invalid Password"});
                }
            } else {
                done(null, false, {message: "No username found."});
            }
        }).catch((err)=>{
            console.error(err);
            done("Something broke.", null);
        });
    }));
};