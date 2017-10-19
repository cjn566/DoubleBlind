import {Model} from "../js/interfaces/Istudy";
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
        if(!req.query.id){

            return res.sendStatus(404)
        }
        context.Study.where("id", req.query.id).fetch({withRelated: ['subjects', 'questions']})
            .then(function (studyModel) {
                if(studyModel) {
                    return res.json(studyModel.toJSON());
                }
                console.error('Study model is null. ID: ' + req.query.id);
                return res.sendStatus(404);
            }).catch((err)=>{
                console.log(err);
                return res.sendStatus(500);
        });
    });

    app.get('/studies', function (req, res) {
        context.Study.where("owner_id", req.user.id).fetchAll().then(function (studyModel) {
            if(studyModel) {
                return res.json(studyModel.toJSON());
            }
            console.error('Studies model is null');
            return res.sendStatus(404);
        })
    });

    app.post('/save', function (req, res) {
        let model;
        let finish = (m) => {
            m.save().then((data) => {
                res.json(data.toJSON());
            }, err);
        };
        switch (req.body.type) {
            case Model.study:

                let tryId = () => {
                    let Id = makeId(10);
                    context.Study.where('link', Id).count().then((count) => {
                        if (count > 0) { // Exists, try again
                            tryId();
                        }
                        else {
                            req.body.data["link"] = Id;
                            req.body.data["owner_id"] = req.user.id;
                            model = new context.Study(req.body.data);
                            finish(model);
                        }
                    });
                };
                tryId();
                break;
            case Model.subject:
                model = new context.Subject(req.body.data);
                finish(model);
                break;
            case Model.question:
                model = new context.Question(req.body.data);
                finish(model);
                break;
            case Model.participant:
                model = new context.Participant(req.body.data);
                finish(model);
                break;
            case Model.answer:
                model = new context.Answer(req.body.data);
                finish(model);
                break;
        }
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
        }, err);

    });


    let err = (e) => {console.error(e)};
}