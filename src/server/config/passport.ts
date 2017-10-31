

let passport = require('passport');

let context = require('./database');

module.exports = (app) => {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) =>{
        done(null, user.id);
    });

    passport.deserializeUser((userId, done) =>{
        context.User.where('id', userId).fetch().then((m)=>{
            if(m){
                let user = m.toJSON();
                delete user.password;
                return done(null, user);
            }
            else{return done("????", null)}
        }).catch((err)=>{
            return done(err, null);
        });
    });

    //require('./strategies/local.strategy')();
};