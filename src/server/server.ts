"use strict";
import {options} from "../common/options";
/// <reference path="Scripts/typings/bookshelf.d.ts" />

let devmode = true;

let loginURL: string = '/login.html';
let path = require('path');
let bodyParser = require('body-parser');
let express = require('express');
let app  = express();

app.use('/', express.static(path.join(__dirname, '../../public'), {
    extensions: ['html', 'htm']
}));

app.use(require('cookie-parser')());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(require('express-session')({
    secret: 'library',
    resave: true,
    saveUninitialized: true}));

require('./config/passport')(app);

app.use('/auth', require('./routes/auth')());


app.all('/join/*', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../../public/join.html'));
});


require('./routes/join_API')(app);


// Ensure logged in
app.use((req, res, next)=>{
    if(!req.user) {
        if(!devmode) {
            let redirect = loginURL;
            if (req.query.join) {
                redirect += "?join=" + req.query.join
            }
            return res.redirect(redirect);
        } else {
            // AUTO LOG IN FOR DEV PURPOSES!
            req.login({id: 2}, (err) => {
                return next();
            });
        }
}
else return next();
});

app.all('/build/*', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../../private/manage.html'));
});

app.use('/', express.static(path.join(__dirname, '../../private'), {
    extensions: ['html', 'htm']
}));

app.use('/', express.static(path.join(__dirname, '../../private/manage'), {
    extensions: ['html', 'htm']
}));

require('./routes/manage_API')(app);


app.all('/*', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

//Nothing found
app.use((req, res)=>{
    res.end();
    //res.redirect('/notfound.html');
});

app.listen(options.port);
console.log("READY");