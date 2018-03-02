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

            let bob = save.data;
            let frank = bob.id;
            let bill = save.data.id;
            let bfr = save.data.required;
            let bsd = save.data.text;

            let idz = (save.data.id > 0? save.data.id : save.data.experiment_id);
            return isOwnerOf((save.data.id > 0 ? Model.question : Model.experiment), idz, userId)
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
                                    s.text = s.map1;
                                });
                                break;
                            case 2:
                                experiment.subjects.map((s) => {
                                    s.text = s.map2;
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

    export function exportData(id: string, questionsFirst: boolean, user) {

        return Promise.all([getExperiment(id, true, user), context.Answer.where({'experiment_id':id}).fetchAll()]).then((data)=>{

            let experiment = data[0];
            if(experiment.stage !== Stage.concluded) return //todo: makeReject({code: ApiCode.notReady, message: 'Not yet concluded.'});

            let answers = data[1].toJSON();

            experiment['participants'] = [...new Set(answers.map(e => e.participant_id))];

            let i = 1, partLine = "\nGuest";
            for(let x in experiment.participants) {partLine += ',' + i++}


            let CSV_string = "Prequestions" + partLine;

            for (let j = 0; j < experiment.preQuestions.length; j++){
                CSV_string += '\n' + experiment.preQuestions[j].text;
                for (let k = 0; k < experiment.participants.length; k++){
                    let answer = answers.find((e)=>{
                        return  e.question_id == experiment.preQuestions[j].id &&
                            e.participant_id == experiment.participants[k]
                    });
                    CSV_string += ',' + (answer? answer.value : '');
                }
            }

            let arrs;
            if(questionsFirst){
                arrs = [experiment.questions, experiment.subjects];
            } else {
                arrs = [experiment.subjects, experiment.questions];
            }

            for(let i = 0; i < arrs[0].length; i++){
                CSV_string += '\n\n' + (questionsFirst? 'Question: ' : 'Subject: ') + arrs[0][i].text + partLine;
                for (let j = 0; j < arrs[1].length; j++){
                    CSV_string += '\n' + arrs[1][j].text;
                    for (let k = 0; k < experiment.participants.length; k++){
                        let answer = answers.find((e)=>{
                            return  e.question_id == experiment.questions[questionsFirst? i : j].id &&
                                    e.subject_id == experiment.subjects[questionsFirst? j : i].id &&
                                    e.participant_id == experiment.participants[k]
                        });
                        CSV_string += ',' + (answer? answer.value : '');
                    }
                }
            }

            return [ experiment.name, CSV_string];
        })
    };

























