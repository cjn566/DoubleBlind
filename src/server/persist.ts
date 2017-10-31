import {isOwnerOf} from "./util/Owner";
import {ApiCode} from "../common/interfaces/codes";
import {Model} from "../common/interfaces/study";
import {makeId} from "./util/makeID";

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
                    return context.Study.where('link', Id).count().then((count) => {
                        if (count > 0) { // Exists, try again
                            return tryId();
                        }
                        else {
                            save.data["link"] = Id;
                            save.data["owner_id"] = userId;
                            return new context.Study(save.data).save();
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
};

/*
*
                    if(req.query.link){ // Return for participants
                        getMyAnswers(study.id, req.user.id).then((answers)=>{
                            study['answers'] = answers;
                            delete study.id;
                            delete study.owner_id;
                            delete study.anon_participants;
                            switch (study.aliases){
                                case 1:
                                    study.subjects.map((s)=>{
                                        s.name = s.map1;
                                    });
                                    break;
                                case 2:
                                    study.subjects.map((s)=>{
                                        s.name = s.map2;
                                    });
                                    break;
                            }
                            delete study.aliases;
                            study.subjects.map((s)=>{
                                delete s.map1;
                                delete s.map2;
                                delete s.study_id;
                            });
                            study.questions.map((s)=>{
                                delete s.study_id;
                                delete s.per_subject;
                            });
                            study.preQuestions = study.questions.filter((q)=>{return !q.per_subject});
                            study.questions = study.questions.filter((q)=>{return q.per_subject});
                            return res.json(study);
                        });


                    } else
*
* */