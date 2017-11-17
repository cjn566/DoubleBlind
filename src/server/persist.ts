import {isOwnerOf} from "./util/Owner";
import {ApiCode} from "../common/interfaces/codes";
import {Model, Stage} from "../common/interfaces/experiment";
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
                    let Id = makeId(10);
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
        case Model.answer:
            save.data["participant_id"] = userId;
            return new context.Answer(save.data).save();
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

export function getExperiment(link: string, user: number, manage: boolean) {
    let options = {
        withRelated: ['subjects', 'questions']
    };
    if(!manage) options['columns'] = ['id', 'name', 'link', 'lock_responses', 'aliases', 'stage'];

    return context.Experiment.where({'id':link}).fetch(options)
        .then(function (experimentModel) {
            let experiment = experimentModel.toJSON();

            experiment.lock_responses = experiment.lock_responses==1;
            experiment.questions.map((q)=>{q.required = q.required == 1});
            experiment.preQuestions = experiment.questions.filter((q)=>{return !q.per_subject});
            experiment.questions = experiment.questions.filter((q)=>{return q.per_subject});

            if(!manage) {
                switch (experiment.stage) {
                    case Stage.build:
                    case Stage.concluded:
                        // return {stage: experiment.stage};
                    case Stage.live:
                        return getMyAnswers(experiment.id, user).then((answers) => {
                            experiment['answers'] = answers;
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
                        });
                    default:
                        return makeReject({code: ApiCode.serverErr, message: "Experiment stage failure"});
                }
            }
            if(experiment.owner_id == user) {
                experiment.anon_participants = experiment.anon_participants==1;
                return experiment;
            } else {
                return makeReject({code: ApiCode.notAuth, message: 'Not the owner of the experiment'})
            }

        });
}