
import {ApiCode, ApiError} from "../../common/interfaces/codes";
import {getMyAnswers, getExperiment} from "../persist";

import * as cookies from 'js-cookie';
let context = require('../config/database');

module.exports = function(app) {

    app.all('/blorp/*', function (req, res, next) {
        var partier = req.cookies.partier;
        if(!partier){
            partier = Date.now();
            // debug: testing cookie
            res.cookie('partier', "TEST");
        }
        req["participant_id"] = partier;
        return next();
    });

    app.get('/blorp/getExperimentForParticipant', function (req, res) {
        getExperiment(req.query.link, false).then((experiment)=>{
            return res.json(experiment);
        }).catch((err)=>{
            apiReject(err, res);
        });
    });

    app.post('/blorp/saveAnswer', function (req, res) {

        let answers = req.body;

        answers.map((e)=> {
            e['participant_id'] = req.participant_id;
        });

        Promise.all(answers.map((answer)=>{
            return new context.Answer(answer).save()
        })).then((data) => {
            res.json(data)
        }).catch((err) => {
            apiReject(err, res);
        });



    });


    app.get('/blorp/myAnswers', function(req, res){
        getMyAnswers(req.query.experiment_id, req.participant_id).then((models)=>{
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