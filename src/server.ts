"use strict";
import {Model} from "./js/interfaces/Istudy";

/// <reference path="Scripts/typings/bookshelf.d.ts" />

namespace DoubleBlind.Database {
  let knex = require('knex')({
    client: 'sqlite3',
    connection: {
      database : 'sqldb',
      filename  : './sqldb.db'
    }
  });

  let bookshelf = require('bookshelf')(knex);
  let cascadeDelete = require('bookshelf-cascade-delete');
  bookshelf.plugin(cascadeDelete);

  export let Subject = bookshelf.Model.extend({
      tableName: 'subject',
  });

  export let Participant = bookshelf.Model.extend({
    tableName: 'participant'
  });

  export let Question = bookshelf.Model.extend({
    tableName: 'question'
  });

  export let Answer = bookshelf.Model.extend({
    tableName: 'answer',
    question: function(){
        return this.belongsTo(Question);
    },
    participant: function(){
        return this.belongsTo(Participant);
    },
    subject: function(){
        return this.belongsTo(Subject);
    }
  });

  export let Study = bookshelf.Model.extend({
    tableName: 'study',
    subjects: function(){
        return this.hasMany(Subject);
    },
      participants: function(){
        return this.hasMany(Participant);
    },
      questions: function(){
        return this.hasMany(Question);
    }
  },{
      dependents: ['subjects', 'participants', 'questions']
  });
}

namespace DoubleBlind.Server{
    
    //let fs = require('fs');
    let path = require('path');
    let bodyParser = require('body-parser');
    let express = require('express');
    let app  = express();
    let sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('sqldb.db');
    let context = DoubleBlind.Database;
    let passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    passport.use(new LocalStrategy(
        function(username, password, done){
            User.findOne
        }
    ));

    app.use('/', express.static(path.join(__dirname, '../public')));

    app.post('/login',
        passport.authenticate('local'),
        function(req, res){
            res.redirect('/users/' + req.user.username);
    });

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
}


