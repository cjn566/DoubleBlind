import {Model} from "../../common/interfaces/experiment";
import {isArray} from "util";
import {ApiCode, ApiError} from "../../common/interfaces/codes";
import {isOwnerOf} from "../util/Owner";
import {doSave, getMyAnswers, getExperiment, getAnswersForHost, exportData} from "../persist";
import * as CSV from 'csv-generate';

let context = require('../config/database');

module.exports = function(app) {

    app.get('/whoami', (req, res) => {
        if (req.user) {
            return res.json(req.user.username);
        }
        return res.sendStatus(500);
    });

    app.get('/getExperimentForOwner', function (req, res) {
        getExperiment(req.query.id, true, req.user.id).then((experiment)=>{
            return res.json(experiment);
        }).catch((err)=>{
            apiReject(err, res);
        });
    });

    app.get('/getNames', function (req, res) {
        context.Experiment.where("id", req.query.id).fetch({columns:['name', 'moniker', 'plural']}).then(function (experimentModel) {
            return res.json(experimentModel.toJSON());
        }).catch((err)=>{
            apiReject(err, res);
        });
    });

    app.get('/studies', function (req, res) {
        context.Experiment.where("owner_id", req.user.id).fetchAll({columns:['id', 'name', 'stage', 'moniker', 'plural']}).then(function (experimentModel) {
            if(experimentModel) {
                return res.json(experimentModel.toJSON());
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
                    case Model.experiment:
                        model = new context.Experiment("id", req.body.id);
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

    app.get('/answersForHost', function(req, res){
        getAnswersForHost(req.query.experiment_id).then((models)=>{
            return res.json(models);
        }).catch((err)=>{
            apiReject(err, res);
        });
    });

    app.get('/export', function(req, res){
        exportData(req.query.experiment_id, (req.query.questionsFirst == 'true'), req.user.id).then((csv)=>{
            res.set({"Content-Disposition":"attachment; filename=\"" + csv[0] + ".csv\"",'Content-type': 'text/csv'});
            res.send(csv[1]);
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
                    res.status(403);
                    break;
                case ApiCode.badRequest:
                    res.status(400);
                    break;
                case ApiCode.serverErr:
                default:
                    res.status(500);
            }
            return res.json(err);
        }
        else {
            er(err);
            res.sendStatus(500);
        }
    }
};