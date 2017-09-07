

let passport = require('passport');


module.exports = (app) => {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) =>{
        done(null, user);
    });

    passport.deserializeUser((userId, done) =>{
        // getUserByID
        done(null, userId);
    });

    require('./strategies/local.strategy')();
};