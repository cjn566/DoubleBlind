"use strict";

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
      subjectFieldValues: function(){
          return this.hasMany(SubjectFieldValue)
      }
  },{
      dependents: ['subjectFieldValues']
  });

  export let SubjectField = bookshelf.Model.extend({
    tableName: 'subjectField',
      subjectFieldValues: function(){
          return this.hasMany(SubjectFieldValue)
      }
  },{
      dependents: ['subjectFieldValues']
  });

  export let SubjectFieldValue = bookshelf.Model.extend({
    tableName: 'subjectFieldValue',
    testerField: function(){
        return this.belongsTo(SubjectField);
    },
    tester: function(){
        return this.belongsTo(Subject);
    }
  });

 export  let Tester = bookshelf.Model.extend({
    tableName: 'tester'
  });

  export let TesterField = bookshelf.Model.extend({
    tableName: 'testerField'
  });

  export let TesterFieldValue = bookshelf.Model.extend({
    tableName: 'testerFieldValue',
    testerField: function(){
        return this.belongsTo(TesterField);
    },
    tester: function(){
        return this.belongsTo(Tester);
    }
  });

  export let Study = bookshelf.Model.extend({
    tableName: 'study',
    subjects: function(){
        return this.hasMany(Subject);
    },
    subjectFields: function(){
        return this.hasMany(SubjectField);
    },
    testers: function(){
        return this.hasMany(Tester);
    },
    testerFields: function(){
        return this.hasMany(TesterField);
    }
  },{
      dependents: ['subjects', 'subjectFields', 'testers', 'testerFields']
  });
}

namespace DoubleBlind.Server{
    
    //let fs = require('fs');
    let path = require('path');
    let bodyParser = require('body-parser');
    let express = require('express');
    let app  = express()

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use('/', express.static(path.join(__dirname, '../public')));

    //let asyncParallel = require('async/parallel');
    //let asyncEach = require('async/each');


    let sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('sqldb.db');

    let context = DoubleBlind.Database;

    app.get("/manager/getStudy",function(req,res){
        context.Study.where("id",req.query.id).fetch({withRelated: ['subjects','subjectFields']})
        .then((data)=>{
            let study=data.toJSON();
            let x = "x";
        });
    });

    //returns a study with all associated subjects, tests, subject fields and test fields and values for those.
    app.get('/getStudy', function (req, res) {
        getStudy(req.query.id).then((study)=>{
            res.json(study);
        });
    });

    let getStudy = function(id){
            return context.Study.where("id", id).fetch({withRelated: ['subjects', 'testers', 'subjectFields', 'testerFields']})
                .then(function (studyModel) {

                    let study = studyModel.toJSON();
                    study.fresh = true;
                    let rowArray = study.subjects || [];
                    let colArray = study.subjectFields || [];
                    let valueModel = context.SubjectFieldValue;

                    let promises = [];

                    // Rows contain the array of values, Cols just contain value headers.
                    rowArray.map((row) => {
                        row.fresh = true;
                        colArray.map((col) => {
                            col.fresh = true;
                            promises.push(valueModel.where({
                                subject_id: row.id,
                                subjectField_id: col.id
                            }).fetch().then(function (valueModel) {
                                if (valueModel) {
                                    let result = valueModel.toJSON();
                                    return {
                                        fresh: true,
                                        id: result.id,
                                        subjectId: row.id,
                                        fieldId: col.id,
                                        value: result.value
                                    }
                                }
                                else return {
                                    fresh: true,
                                    id: 0,
                                    subjectId: row.id,
                                    fieldId: col.id,
                                    value: ""
                                };
                            }));
                        });
                    });

                    return Promise.all(promises).then(values => {
                        study.subjects.map((subject) => {
                            subject.entries = values.filter((value) => {
                                return value.subjectId === subject.id
                            })
                        });
                        return study;
                    })

                }).catch(function (err) {
                    console.error(err);
                });
    };

    app.get('/studies', function (req, res) {
        context.Study.fetchAll().then(function(studyModels){
            let studies = studyModels.toJSON();
            res.json(studies);
        })
    });


    app.post('/save', function(req, res){
        console.log(req.body)
        switch (req.body.type){
            case 'study':
                new context.Study(req.body.data).save().then((study) => {
                    res.json(study);
                }, err)
                break;
            case 'field':
                new context.SubjectField(req.body.data).save().then((field) => {
                    res.json(field);
                }, err)
                break;
            case 'subject':
                new context.Subject(req.body.data).save().then((subject) => {
                    res.json(subject);
                }, err)
                break;
            case 'entry':
                new context.SubjectFieldValue(req.body.data).save().then((entry) => {
                    res.json(entry);
                }, err)
                break;
        }
    });

    app.post('/delete', function(req, res){
        console.log(req.body)
        switch (req.body.type) {
            case 'subject':
                new context.Subject("id", req.body.id).destroy().then((result)=>{
                    res.json(result);
                }, err);
                break;
            case 'field':
                new context.SubjectField("id", req.body.id).destroy().then((result)=>{
                    res.json(result);
                }, err);
                break;
            case 'study':
                new context.Study("id", req.body.id).destroy().then((result)=>{
                    res.json(result);
                }, err);
                break;
        }
    });

    let err = (e) => {console.error(e)};

    app.listen(3000);
    console.log("READY");
}


