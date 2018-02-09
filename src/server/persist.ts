import {isOwnerOf} from "./util/Owner";
import {ApiCode} from "../common/interfaces/codes";
import {DataOrder, Model, Stage} from "../common/interfaces/experiment";
import {makeId, makeReject} from "./util/makeID";
import * as context from './config/database';

export function doSave(save, userId) {
    switch (save.type) {
        case Model.experiment:
            if (save.data.id) {
                return isOwnerOf(Model.experiment, save.data.id, userId).then((authed) => {
                    if (authed) {
                        return new context.Experiment(save.data).save();
                    }
                    return Promise.reject({
                        code: ApiCode.notAuth,
                        message: "You aren't the owner of that experiment."
                    });
                })
            } else {
                let tryId = () => {
                    let Id = makeId(4);
                    return context.Experiment.where('id', Id).count().then((count) => {
                        if (count > 0) { // Exists, try again
                            return tryId();
                        }
                        else {
                            save.data.id = Id;
                            save.data["owner_id"] = userId;
                            return new context.Experiment().save(save.data,{method: 'insert'});
                        }
                    });
                };
                return tryId();
            }
        case Model.subject:
            return isOwnerOf((save.data.id>0 ? Model.subject : Model.experiment), (save.data.id ? save.data.id : save.data.experiment_id), userId)
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
            return isOwnerOf((save.data.id > 0 ? Model.question : Model.experiment), (save.data.id ? save.data.id : save.data.experiment_id), userId)
                .then((authed) => {
                    if (authed) {
                        return new context.Question(save.data).save();
                    }
                    return Promise.reject({
                        code: ApiCode.notAuth,
                        message: "You aren't the owner of that question."
                    });
                });
    }
}

export function getMyAnswers(experiment_id, part_id) {
    return context.Answer.where({"participant_id":part_id, "experiment_id":experiment_id}, ).fetchAll().then((models)=>{
        return models.toJSON();
    })
}

export function getAnswersForHost(experiment_id) {
    return context.Answer.where({"experiment_id":experiment_id}).fetchAll({columns: ['id', 'question_id', 'subject_id', 'participant_id', 'timestamp']}).then((models)=>{
        return models.toJSON();
    })
}

export function getExperiment(link: string, manage: boolean, user?: number) {
    let options = {
        withRelated: ['subjects', 'questions']
    };
    if (!manage) options['columns'] = ['id', 'name', 'link', 'lock_responses', 'aliases', 'stage'];

    return context.Experiment.where({'id': link}).fetch(options)
        .then(function (experimentModel) {
            let experiment = experimentModel.toJSON();

            experiment.lock_responses = experiment.lock_responses == 1;
            experiment.questions.map((q) => {
                q.required = q.required == 1
            });
            experiment.preQuestions = experiment.questions.filter((q) => {
                return !q.per_subject
            });
            experiment.questions = experiment.questions.filter((q) => {
                return q.per_subject
            });

            if (!manage) {
                switch (experiment.stage) {
                    case Stage.build:
                    case Stage.concluded:
                    // return {stage: experiment.stage};
                    case Stage.live:
                        switch (experiment.aliases) {
                            case 1:
                                experiment.subjects.map((s) => {
                                    s.name = s.map1;
                                });
                                break;
                            case 2:
                                experiment.subjects.map((s) => {
                                    s.name = s.map2;
                                });
                                break;
                        }
                        delete experiment.aliases;
                        experiment.subjects.map((s) => {
                            delete s.map1;
                            delete s.map2;
                        });
                        return experiment;
                    default:
                        return makeReject({code: ApiCode.serverErr, message: "Experiment stage failure"});
                }
            }
            if (experiment.owner_id == user) {
                experiment.anon_participants = experiment.anon_participants == 1;
                return experiment;
            } else {
                return makeReject({code: ApiCode.notAuth, message: 'Not the owner of the experiment'})
            }

        });
}

    export function exportData(id: string, orderKeys) {

        let q_first = ['question', 'subject', 'participant'];
        let s_first = ['subject', 'question', 'participant'];
        orderKeys = s_first;

        let questionsFirst = true;

        Promise.all([context.Experiment.where({'id':id}).fetch({withRelated: ['subjects', 'questions']}), context.Answer.where({'experiment_id':id}).fetchAll()]).then((data)=>{
            let experiment = data[0].toJSON();
            let answers = data[1].toJSON();

            experiment['participants'] = [...new Set(answers.map(e => e.participant_id))];



            /*
            answers = answers.sort((a, b)=>{
                if(a.question_id == b.question_id){
                    if(a.subject_id == b.subject_id){
                        return a.participant_id - b.participant_id;
                    }
                    return a.subject_id - b.subject_id;
                }
                return a.question_id - b.question_id
            });*/

            let map = {};

            let keys = {
                subject: {
                    answerPropName: 'subject_id',
                    experimentPropName:
                        'subjects'
                }
                ,
                'question': {
                    answerPropName: 'question_id',
                    experimentPropName:
                        'questions'
                }
                ,
                'participant': {
                    answerPropName: 'participant_id',
                    experimentPropName:
                        'participants'
                }
            };

            let order = [keys[orderKeys[0]],keys[orderKeys[1]],keys[orderKeys[2]]];


            let nameLists = {};

            for(let i = 0; i < 3; i++) {
                nameLists[orderKeys[i]] = {};
                experiment[order[i].experimentPropName].map((e) => {
                    switch (order[i].experimentPropName){
                        case 'questions':
                            nameLists[orderKeys[i]][e.id] = e.text;
                            break;
                        case 'subjects':
                            nameLists[orderKeys[i]][e.id] = e.name;
                            break;
                    }
                });
            }

            for(let i = 0; i < answers.length; i++){
                let a = answers[i];
                let first = a[order[0].answerPropName];
                let second = a[order[1].answerPropName];
                let third = a[order[2].answerPropName];
                let v = a.value;

                if(!map[first]) map[first] = {};
                if(!map[first][second]) map[first][second] = [];
                map[first][second].push([third, v]);
            }

            let CSV_string = "";

            /*
            for (let p1 in map) {
                CSV_string += orderKeys[0] +  ": " + nameLists[orderKeys[0]][p1] + "\n";
                if (map.hasOwnProperty(p1)) {
                    for(let i = 0; i < p1.length; i++) {

                    }
                }
            }
            */

            for(let i = 0; i < experiment.questions.length; i++){
                CSV_string += '\n\n' + experiment.questions[i].text;

                for (let j = 0; j < experiment.subjects.length; j++){
                    CSV_string += '\n' + experiment.subjects[j].name;
                    for (let k = 0; k < experiment.participants.length; k++){
                        CSV_string += ',' + answers.find((e)=>{
                            return e.question_id == experiment.questions[i].id &&
                                e.subject_id == experiment.subjects[j].id &&
                                e.participant_id == experiment.participants[i].id
                        }).value
                    }
                }
            }

            console.log(CSV_string);
        })
    };

























