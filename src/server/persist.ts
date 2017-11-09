import {isOwnerOf} from "./util/Owner";
import {ApiCode} from "../common/interfaces/codes";
import {Model, Stage} from "../common/interfaces/study";
import {makeId, makeReject} from "./util/makeID";
import * as context from './config/database';

export function doSave(save, userId) {
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
                    return context.Study.where('id', Id).count().then((count) => {
                        if (count > 0) { // Exists, try again
                            return tryId();
                        }
                        else {
                            save.data.id = Id;
                            save.data["owner_id"] = userId;
                            return new context.Study().save(save.data,{method: 'insert'});
                        }
                    });
                };
                return tryId();
            }
        case Model.subject:
            return isOwnerOf((save.data.id>0 ? Model.subject : Model.study), (save.data.id ? save.data.id : save.data.study_id), userId)
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
            return isOwnerOf((save.data.id > 0 ? Model.question : Model.study), (save.data.id ? save.data.id : save.data.study_id), userId)
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

export function getMyAnswers(study_id, part_id) {
    return context.Answer.where({"participant_id":part_id, "study_id":study_id}, ).fetchAll().then((models)=>{
        return models.toJSON();
    })
}

export function getStudy(link: string, user: number, manage: boolean) {
    let options = {
        withRelated: ['subjects', 'questions']
    };
    if(!manage) options['columns'] = ['id', 'name', 'link', 'lock_responses', 'aliases', 'stage'];

    return context.Study.where({'id':link}).fetch(options)
        .then(function (studyModel) {
            let study = studyModel.toJSON();

            study.lock_responses = study.lock_responses==1;
            study.questions.map((q)=>{q.required = q.required == 1});
            study.preQuestions = study.questions.filter((q)=>{return !q.per_subject});
            study.questions = study.questions.filter((q)=>{return q.per_subject});

            if(!manage) {
                switch (study.stage) {
                    case Stage.build:
                    case Stage.concluded:
                        // return {stage: study.stage};
                    case Stage.live:
                        return getMyAnswers(study.id, user).then((answers) => {
                            study['answers'] = answers;
                            switch (study.aliases) {
                                case 1:
                                    study.subjects.map((s) => {
                                        s.name = s.map1;
                                    });
                                    break;
                                case 2:
                                    study.subjects.map((s) => {
                                        s.name = s.map2;
                                    });
                                    break;
                            }
                            delete study.aliases;
                            study.subjects.map((s) => {
                                delete s.map1;
                                delete s.map2;
                            });
                            return study;
                        });
                    default:
                        return makeReject({code: ApiCode.serverErr, message: "Study stage failure"});
                }
            }
            if(study.owner_id == user) {
                study.anon_participants = study.anon_participants==1;
                return study;
            } else {
                return makeReject({code: ApiCode.notAuth, message: 'Not the owner of the study'})
            }

        });
}