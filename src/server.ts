"use strict";
import {Model} from "./js/interfaces/Istudy";

/// <reference path="Scripts/typings/bookshelf.d.ts" />

let path = require('path');
let bodyParser = require('body-parser');
let express = require('express');
let app  = express();
let sqlite3 = require('sqlite3').verbose();
let context = require('./config/database');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let authRoutes = require('./routes/authRoutes');

app.use('/', express.static(path.join(__dirname, '../public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'library',
    resave: true,
    saveUninitialized: true}));
require('./config/passport')(app);
app.use('/auth', authRoutes());

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../public/participate/idx-participate.html'))
});

app.get('/manage', (req, res)=>{
    res.sendFile(path.join(__dirname, '../public/manage/idx-manage.html'))
});

app.get('/getStudy', function (req, res) {
    context.Study.where("id", req.query.id).fetch({withRelated: ['subjects', 'questions']})
        .then(function (studyModel) {
            res.json(studyModel.toJSON());
        });
});

app.get('/studies', function (req, res) {
    context.Study.fetchAll().then(function(studyModels){
        let studies = studyModels.toJSON();
        res.json(studies);
    })
});


app.post('/save', function(req, res){
    console.log(req.body);
    let model;
    switch (req.body.type){
        case Model.study:
            model = new context.Study(req.body.data);
            break;
        case Model.subject:
            model = new context.Subject(req.body.data);
            break;
        case Model.question:
            model = new context.Question(req.body.data);
            break;
        case Model.participant:
            model = new context.Participant(req.body.data);
            break;
        case Model.answer:
            model = new context.Answer(req.body.data);
            break;
    }
    model.save().then((data) => {
        res.json(data);
    }, err);
});

app.post('/delete', function(req, res){
    console.log(req.body);
    let model;
    switch (req.body.type) {
        case Model.subject:
            model = new context.Subject("id", req.body.id);
            break;
        case Model.question:
            model = new context.Question("id", req.body.id);
            break;
        case Model.study:
            model = new context.Study("id", req.body.id);
            break;
    }
    model.destroy().then((result)=>{
        res.json(result);
    }, err);

});

let err = (e) => {console.error(e)};

app.listen(3000);
console.log("READY");
