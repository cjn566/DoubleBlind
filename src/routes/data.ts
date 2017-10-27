import {Model} from "../js/interfaces/study";
import {error, isArray} from "util";
import {ApiCode, ApiError} from "../js/interfaces/codes";
import {isOwnerOf} from "../util/Owner";
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
                    let preQuestions = study.questions.filter((q)=>{return !q.per_subject});
                    let questions = study.questions.filter((q)=>{return q.per_subject});
                    study.questions = questions;
                    study.preQuestions = preQuestions;
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

    let doSave = (save, userId) => {
        switch (save.type) {
            case Model.study:
                if (save.data.id) {
                    return isOwnerOf(Model.study, save.data.id, userId).then((authed) => {
                        if (authed) {
                            return new context.Study(save.data).save();
                        }
                        return Promise.reject({
                            code: ApiCode.notAuth,
                            message: "You aren't the owner of that study."
                        });
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
                                save.data["owner_id"] = userId;
                                return new context.Study(save.data).save();
                            }
                        });
                    };
                    return tryId();
                }
            case Model.subject:
                return isOwnerOf((save.data.id ? Model.subject : Model.study), (save.data.id ? save.data.id : save.data.study_id), userId)
                    .then((authed) => {
                        if (authed) {
                            return new context.Subject(save.data).save();
                        }
                        return Promise.reject({
                            code: ApiCode.notAuth,
                            message: "You aren't the owner of that subject."
                        });
                    });
            case Model.question:
                return isOwnerOf((save.data.id ? Model.question : Model.study), (save.data.id ? save.data.id : save.data.study_id), userId)
                    .then((authed) => {
                        if (authed) {
                            return new context.Question(save.data).save();
                        }
                        return Promise.reject({
                            code: ApiCode.notAuth,
                            message: "You aren't the owner of that question."
                        });
                    });
            case Model.answer:
                save.data["participant_id"] = userId;
                return new context.Answer(save.data).save();
        }
    };


    app.post('/save', function (req, res) {
        let saveWithId = (save) => {doSave(save, req.user.id)}
        if(isArray(req.body)) {
            Promise.all(req.body.map(saveWithId)).then((data) => {
                res.json(data)
            }).catch((err) => {
                apiReject(err, res);
            });
        }
        else{
            doSave(req.body, req.user.id).then((data) => {
                res.json(data)
            }).catch((err) => {
                apiReject(err, res);
            });
        }
    });

    app.post('/delete', function (req, res) {
        isOwnerOf(req.body.type, req.body.id, req.user.id).then((authed)=>{
            if(authed){
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
            } else {
                apiReject({code:ApiCode.notAuth, message: "Cannot delete, you are not the owner."}, res);
            }
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