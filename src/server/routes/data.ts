import {Model} from "../../common/interfaces/study";
import {isArray} from "util";
import {ApiCode, ApiError} from "../../common/interfaces/codes";
import {isOwnerOf} from "../util/Owner";
import {doSave} from "../persist";

let context = require('../config/database');

module.exports = function(app) {

    app.get('/whoami', (req, res) => {
        if (req.user) {
            return res.json(req.user);
        }
        return res.sendStatus(500);
    });

    app.get('/getStudyForParticipant', function (req, res) {

    });

    app.get('/getStudyForOwner', function (req, res) {
        context.Study.where({'id':req.query.id}).fetch({withRelated: ['subjects', 'questions']})
            .then(function (studyModel) {
                if(studyModel) {
                    let study = studyModel.toJSON();
                    if(study.owner_id === req.user.id){ // Return for owner
                        study.preQuestions = study.questions.filter((q)=>{return !q.per_subject});
                        study.questions = study.questions.filter((q)=>{return q.per_subject});
                        return res.json(study);
                    } else {
                        return apiReject({
                            code: ApiCode.notAuth,
                            message: 'Not the owner of this study.'
                        }, res);
                    }
                }
                else {
                    console.warn('Study model is null. ID: ' + req.query.id);
                    return apiReject({
                        code: ApiCode.badRequest,
                        message: "That study doesn't exist."
                    }, res);
                }
            }).catch((err)=>{
                apiReject(err, res);
            });
    });

    app.get('/studies', function (req, res) {
        context.Study.where("owner_id", req.user.id).fetchAll({columns:['id', 'name', 'stage']}).then(function (studyModel) {
            if(studyModel) {
                return res.json(studyModel.toJSON());
            }
            console.error('Studies model is null');
            return res.sendStatus(404);
        }).catch((err)=>{
            apiReject(err, res);
        });
    });


    app.post('/save', function (req, res) {
        let saveWithId = (save) => {return doSave(save, req.user.id)}
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

    let getMyAnswers = (study_id, part_id) => {
        return context.Answer.where({"participant_id":part_id, "study_id":study_id}, ).fetchAll().then((models)=>{
            return models.toJSON();
        })
    };

    app.get('/myAnswers', function(req, res){
        getMyAnswers(req.query.study_id, req.user.id).then((models)=>{
            return res.json(models);
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