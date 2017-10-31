

import {Model} from "../../common/interfaces/study";
import {ApiCode, ApiError} from "../../common/interfaces/codes";
let context = require('../config/database');

export function getOwnerTree(id:number) {
    return context.Study.where({'owner_id':id}).fetchAll({'columns':'id'}).then((data)=>{
        let studies = data.toJSON().map(e => e.id);
        return Promise.all([
            Promise.all(studies.map((e)=>{
                return context.Subject.where({'study_id':e}).fetchAll({'columns':'id'})
            })).then((data)=>{
                let newdata = [];
                data.map((s:any)=>{
                    return s.toJSON().map((e)=>{
                        newdata.push(e.id);
                    })
                });
                return newdata;
            }),
            Promise.all(studies.map((e)=>{
                return context.Question.where({'study_id':e}).fetchAll({'columns':'id'})
            })).then((data)=>{
                let newdata = [];
                data.map((q:any)=>{
                    return q.toJSON().map((e)=>{
                        newdata.push(e.id);
                    })
                });
                return newdata;
            })
        ]).then((data)=>{
            console.log(data);
            return {
                'studies': studies,
                'subjects': data[0],
                'questions': data[1]
            }
        });
    })
};

export function getOwnerOf(type: Model, id: number) {
    let model, options = {};
    switch(type){
        case Model.subject:
            model = context.Subject;
            options = {withRelated:'study'};
            break;
        case Model.question:
            model = context.Question;
            options = {withRelated:'study'};
            break;
        case Model.study:
            model = context.Study;
            break;
        case Model.question:
            model = context.Question;
        default:
            return Promise.reject(new Error('invalid type request'));
    }
    return model.where({'id':id}).fetch(options).then((data)=>{
        if(data) {
            switch (type) {
                case Model.subject:
                case Model.question:
                    return data.toJSON().study.owner_id;
                case Model.study:
                    return data.toJSON().owner_id;
                case Model.question:
                    return data.toJSON().participant_id;
                default:
                    return Promise.reject(new Error('invalid type request'));
            }
        } else{
            return Promise.reject({code:ApiCode.serverErr, message: 'Could not find owner'})
        }
    });
};

export function isOwnerOf(type: Model, id: number, userId:number) {
    return getOwnerOf(type, id).then((owner_id)=>{
        return owner_id == userId;
    });
};