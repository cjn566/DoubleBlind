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
        if(!req.query){
            return res.sendStatus(400)
        }
        context.Study.where(req.query).fetch({withRelated: ['subjects', 'questions']})
            .then(function (studyModel) {
                if(studyModel) {
                    return res.json(studyModel.toJSON());
                }
                console.error('Study model is null. ID: ' + req.query.id);
                return res.sendStatus(400);
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
        Promise.all(req.body.map((save)=>{
            let model;
            switch (save.type) {
                case Model.study:
                    let tryId = () => {
                        let Id = makeId(10);
                        context.Study.where('link', Id).count().then((count) => {
                            if (count > 0) { // Exists, try again
                                tryId();
                            }
                            else {
                                save.data["link"] = Id;
                                save.data["owner_id"] = req.user.id;
                                model = new context.Study(save.data);
                                return model.save();
                            }
                        });
                    };
                    tryId();
                    break;
                case Model.subject:
                    model = new context.Subject(save.data);
                    return model.save();
                case Model.question:
                    model = new context.Question(save.data);
                    return model.save();
                case Model.participant:
                    model = new context.Participant(save.data);
                    return model.save();
                case Model.answer:
                    model = new context.Answer(save.data);
                    return model.save();
            }
        })).then((data)=>{res.json(data)});
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


    app.get('/myAnswers', function(req, res){
        context.Answer.where({"participant_id":req.user.id}, ).fetchAll({'columns':'subject_id'}).then((models)=>{
            let data = models.toJSON();
            data = data.map(e => e.subject_id);
            data = data.filter((item, pos)=>{
                    return data.indexOf(item) == pos;
                });
            return res.json(data);
        })
    });


    let err = (e) => {console.error(e)};
}