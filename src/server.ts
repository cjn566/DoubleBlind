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

  export let Subject = bookshelf.Model.extend({
    tableName: 'subject'
  });

  export let SubjectField = bookshelf.Model.extend({
    tableName: 'subjectField'
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
        return context.Study.where("id", id).fetch({ withRelated: ['subjects', 'testers', 'subjectFields', 'testerFields'] })
        .then(function (studyModel) {

            let study = studyModel.toJSON();
            study.fresh = true;
            let rowArray = study.subjects || [];
            let colArray = study.subjectFields  || [];
            let valueModel = context.SubjectFieldValue;

            let promises = [];

            // Rows contain the array of values, Cols just contain value headers.
            rowArray.map((row)=>{
                row.fresh = true;
                colArray.map((col)=>{
                    col.fresh = true;
                    promises.push(valueModel.where({
                        subject_id: row.id,
                        subjectField_id: col.id
                    }).fetch().then(function(valueModel){
                        if(valueModel){
                            let result = valueModel.toJSON();
                            return {
                                fresh : true,
                                id: result.id,
                                subjectId: row.id,
                                fieldId: col.id,
                                value: result.value
                            }
                        }
                        else return {
                            fresh : true,
                            id: 0,
                            subjectId: row.id,
                            fieldId: col.id,
                            value: "empty"
                        };
                    }));
                });
            });

            return Promise.all(promises).then(values => {
                study.subjects.map((subject)=> {
                    subject.entries = values.filter((value)=>{
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


    app.post('/saveStudy', function(req, res){
        let save = req.body;
        let studyId = save.studyId;
        console.log(save);
        let idMap = {
            subjects: [],
            fields: []
        };


        let saveValueAndDeletes = ()=>{
            let promises = [];
            save.values.map((entry)=> {
                promises.push(
                    (entry.id < 1) ?
                        new context.SubjectFieldValue(
                            {
                                subject_id:
                                    (entry.subjectId < 1)?
                                        idMap.subjects.find(x => x[0] == entry.subjectId)[1] :
                                        entry.subjectId,
                                subjectField_id:
                                    (entry.fieldId < 1)?
                                        idMap.fields.find(x => x[0] == entry.fieldId)[1] :
                                        entry.fieldId,
                                value: entry.value
                            }, {
                                method: "insert"
                            }).save()

                        : new context.SubjectFieldValue(
                        {
                            id: entry.id,
                            value: entry.value
                        }, {
                            method: "update",
                            patch: true
                        }).save());
            });

            save.deletes.map((del)=>{
                if(del) {
                    switch (del.type) {
                        case "subject":
                            promises.push(new context.Subject({id: del.id}).destroy());
                            break;
                        case "subjectField":
                            promises.push(new context.SubjectField({id: del.id}).destroy());
                            break;
                        case "subjectFieldValue":
                            promises.push(new context.SubjectFieldValue({id: del.id}).destroy());
                            break;
                    }
                }
            });

            Promise.all(promises).then((entries)=>{
                getStudy(studyId).then((study)=>{
                    res.json(study);
                });
            }, (error)=>{
                console.error(error);
                res.sendStatus(500);
            });
        };

        let saveHeaders = ()=> {
            let subjectPromises = [];
            let fieldPromises = [];
            let done = false;

            save.subjects.map((update) => {
                subjectPromises.push(
                    (update.id < 1) ?
                        new context.Subject(
                            {
                                study_id: studyId,
                                name: update.name
                            }, {
                                method: "insert"
                            }).save()

                        : new context.Subject(
                        {
                            id: update.id,
                            name: update.name
                        }, {
                            method: "update",
                            patch: true
                        }).save());
                idMap.subjects.push([update.id]);
            });

            save.fields.map((update)=>{
                fieldPromises.push(
                    (update.id < 1) ?
                        new context.SubjectField(
                            {
                                study_id: studyId,
                                name: update.name
                            }, {
                                method: "insert"
                            }).save()

                        : new context.SubjectField(
                        {
                            id: update.id,
                            name: update.name
                        }, {
                            method: "update",
                            patch: true
                        }).save());
                idMap.fields.push([update.id]);
            });

            Promise.all(subjectPromises).then((subjects)=>{
                subjects.map((subject, idx)=>{
                    idMap.subjects[idx].push(subject.attributes.id);
                });
                if(!done)
                    done = true;
                else
                    saveValueAndDeletes();
            }, (error)=>{
                console.error(error);
                res.sendStatus(500);
            });

            Promise.all(fieldPromises).then((fields)=>{
                fields.map((field, idx)=>{
                    idMap.fields[idx].push(field.attributes.id);
                });
                if(!done)
                    done = true;
                else
                    saveValueAndDeletes();
            }, (error)=>{
                console.error(error);
                res.sendStatus(500);
            })

        };

        if(save.study){
            if(studyId < 1){
                new context.Study({
                    name: save.study.name,
                    stage: save.study.stage
                }, {
                    method: "insert"
                }).save().then((study)=>{
                    studyId = study.attributes.id;
                    saveHeaders();
                }, (error)=>{
                    console.error(error);
                    res.sendStatus(500);
                })
            }
            else{
                new context.Study({
                    id: studyId,
                    name: save.study.name,
                    stage: save.study.stage
                }).save().catch((error)=>{
                    console.error(error);
                    res.sendStatus(500);
                });
                saveHeaders();
            }
        }
        else saveHeaders();
    });



    app.listen(3000);
    console.log("READY");
}


