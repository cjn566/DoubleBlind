import {Model} from "../js/interfaces/study";
import {error} from "util";
import {ApiCode, ApiError} from "../js/interfaces/codes";
let makeId = require('../util/makeID');

let context = require('../config/database');

module.exports = function(app) {

    app.get('/whoami', (req, res) => {
        if (req.user) {
            return res.json(req.user);
        }
        return res.sendStatus(500);
    });

    app.get('/getStudy', function (req, res) {
        if(!(req.query.id || req.query.link)){
            return apiReject({
                code: ApiCode.badRequest,
                message: 'malformed request'
            }, res);
        }
        context.Study.where(req.query).fetch({withRelated: ['subjects', 'questions']})
            .then(function (studyModel) {
                if(studyModel) {
                    let study = studyModel.toJSON();
                    if(study.owner_id != req.user.id){
                        return apiReject({
                            code: ApiCode.notAuth,
                            message: 'Not the owner of this study.'
                        }, res);
                    }
                    return res.json(study);
                }
                console.warn('Study model is null. ID: ' + req.query.id);
                return apiReject({
                    code: ApiCode.badRequest,
                    message: "That study doesn't exist."
                }, res);
            }).catch((err)=>{
                apiReject(err, res);
            });
    });

    app.get('/studies', function (req, res) {
        context.Study.where("owner_id", req.user.id).fetchAll().then(function (studyModel) {
            if(studyModel) {
                return res.json(studyModel.toJSON());
            }
            console.error('Studies model is null');
            return res.sendStatus(404);
        }).catch((err)=>{
            apiReject(err, res);
        });
    });

    let getOwnerTree = (id:number) => {
        return context.Study.where({'owner_id':id}).fetchAll({'columns':'id'}).then((data)=>{
            let studies = data.toJSON().map(e => e.id);
            return Promise.all([
                Promise.all(studies.map((e)=>{
                    return context.Subject.where({'study_id':e}).fetchAll({'columns':'id'})
                })).then((data)=>{
                    let newdata = [];
                    data.map((s:any)=>{
                        return s.toJSON().map((e)=>{
                            newdata.push(e.id);
                        })
                    });
                    return newdata;
                }),
                Promise.all(studies.map((e)=>{
                    return context.Question.where({'study_id':e}).fetchAll({'columns':'id'})
                })).then((data)=>{
                    let newdata = [];
                    data.map((q:any)=>{
                        return q.toJSON().map((e)=>{
                            newdata.push(e.id);
                        })
                    });
                    return newdata;
                })
            ]).then((data)=>{
                console.log(data);
                return {
                    'studies': studies,
                    'subjects': data[0],
                    'questions': data[1]
                }
            });
        })
    };

    let getOwnerOf = (type: Model, id: number) =>{
        let model, options = {};
        switch(type){
            case Model.subject:
                model = context.Subject;
                options = {withRelated:'study'};
                break;
            case Model.question:
                model = context.Subject;
                options = {withRelated:'study'};
                break;
            case Model.study:
                model = context.Study;
                break;
            case Model.question:
                model = context.Question;
            default:
                return Promise.reject(new Error('invalid type request'));
        }
        return model.where({'id':id}).fetch(options).then((data)=>{
            switch(type){
                case Model.subject:
                case Model.question:
                    return data.toJSON().study.owner_id;
                case Model.study:
                    return data.toJSON().owner_id;
                case Model.question:
                    return data.toJSON().participant_id;
                default:
                    return Promise.reject(new Error('invalid type request'));
            }
        });
    };

    app.post('/save', function (req, res) {
        getOwnerOf(Model.answer, 57).then((id)=>{
            console.log(id)
        }, (err)=>{console.error(err)});

        Promise.all(req.body.map((save)=>{
            switch (save.type) {
                case Model.study:
                    if(save.data.id){
                        return getOwnerOf(Model.study, save.data.id).then((owner_id)=>{
                            if(owner_id == req.user.id){
                                return new context.Study(save.data).save();
                            }
                            return Promise.reject({code: ApiCode.notAuth, message: "You aren't the owner of that study."});
                        })
                    } else {
                        let tryId = () => {
                            let Id = makeId(10);
                            return context.Study.where('link', Id).count().then((count) => {
                                if (count > 0) { // Exists, try again
                                    return tryId();
                                }
                                else {
                                    save.data["link"] = Id;
                                    save.data["owner_id"] = req.user.id;
                                    return new context.Study(save.data).save();
                                }
                            });
                        };
                        return tryId();
                    }
                case Model.subject:
                    return getOwnerOf((save.data.id? Model.subject : Model.study), (save.data.id? save.data.id : save.data.study_id))
                        .then((owner_id)=>{
                            if(owner_id == req.user.id){
                                return new context.Subject(save.data).save();
                            }
                            return Promise.reject({code: ApiCode.notAuth, message: "You aren't the owner of that subject."});
                        });
                case Model.question:
                    return getOwnerOf((save.data.id? Model.question : Model.study), (save.data.id? save.data.id : save.data.study_id))
                        .then((owner_id)=>{
                            if(owner_id == req.user.id){
                                return new context.Subject(save.data).save();
                            }
                            return Promise.reject({code: ApiCode.notAuth, message: "You aren't the owner of that question."});
                        });
                case Model.answer:
                    save.data["participant_id"] = req.user.id;
                    return new context.Answer(save.data).save();
            }
        })).then((data)=>{res.json(data)}).catch((err)=>{
            apiReject(err, res);
        });
    });

    app.post('/delete', function (req, res) {
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
        model.destroy().then((result) => {
            res.json(result);
        }).catch((err)=>{
            apiReject(err, res);
        });

    });


    app.get('/myAnswers', function(req, res){
        context.Answer.where({"participant_id":req.user.id, "study_id":req.query.study_id}, ).fetchAll().then((models)=>{
            let data = models.toJSON();
            return res.json(data);
        }).catch((err)=>{
            apiReject(err, res);
        });
    });


    let er = (e)=>{
        console.error(e);
    };

    let apiReject = (err:ApiError, res)=>{
        if(err.message) {
            er(err.message);
            switch (err.code) {
                case ApiCode.notAuth:
                    res.sendStatus(403);
                    break;
                case ApiCode.badRequest:
                    res.sendStatus(400);
                    break;
                case ApiCode.serverErr:
                default:
                    res.sendStatus(500);
            }
        }
        else {
            er(err);
            res.sendStatus(500);
        }
    }
};