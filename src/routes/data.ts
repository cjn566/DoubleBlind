import {Model} from "../js/interfaces/Istudy";
let makeId = require('../util/makeID');

let context = require('../config/database');

module.exports = function(app) {

    app.get('/whoami', (req, res) => {
        if (req.user) {
            return res.json(req.user);
        }
        return res.json(null);
    });

    app.get('/getStudy', function (req, res) {
        context.Study.where("id", req.query.id).fetch({withRelated: ['subjects', 'questions']})
            .then(function (studyModel) {
                res.json(studyModel.toJSON());
            });
    });

    app.get('/studies', function (req, res) {
        context.Study.fetchAll().then(function (studyModels) {
            let studies = studyModels.toJSON();
            res.json(studies);
        })
    });


    app.post('/save', function (req, res) {
        if (!req.user) {
            res.status(502).end()
        }
        let model;
        let finish = (m) => {
            m.save().then((data) => {
                res.json(data);
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