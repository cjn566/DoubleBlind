"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="Scripts/typings/bookshelf.d.ts" />
let loginURL = '/login.html';
let path = require('path');
let bodyParser = require('body-parser');
let express = require('express');
let app = express();
app.use('/', express.static(path.join(__dirname, '../public')));
app.use(require('cookie-parser')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(require('express-session')({
    secret: 'library',
    resave: true,
    saveUninitialized: true
}));
require('./config/passport')(app);
app.use('/auth', require('./routes/auth')());
// Ensure logged in
app.use((req, res, next) => {
    if (!req.user) {
        /*
        let redirect = loginURL;
        if(req.query.join){
            redirect += "?join=" + req.query.join
        }
        return res.redirect(redirect);
    */
        // AUTO LOG IN FOR DEV PURPOSES!
        req.login({ id: 2 }, (err) => {
            return next();
        });
        /*
        */
    }
    else
        return next();
});
app.use('/', express.static(path.join(__dirname, '../private')));
require('./routes/data')(app);
//Nothing found
app.use((req, res) => {
    res.redirect('/notfound.html');
});
app.listen(3000);
console.log("READY");
//# sourceMappingURL=server.js.map