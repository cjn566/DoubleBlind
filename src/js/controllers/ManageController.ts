

import {Stage, Study} from "../interfaces/Istudy";

export default class {
    logger;
    manageService;
    state;
    loading: boolean = false;
    indexer: number = -1;

    constructor(log, manageService, state, params){
        this.manageService = manageService;
        this.logger = log;
        this.state = state;
        this.study = params.study;
    }

    newFieldName:string = "";
    newSubjectName:string = "";
    study: Study;

    log = (m)=>{
        this.logger.log(m);
    };

    err = (e)=>{this.logger.error(e)};

    addSubjectField = ()=>{
        if(this.newFieldName.length > 0) {
            this.manageService.save({
                type: 'field',
                data: {
                    name: this.newFieldName,
                    study_id: this.study.id
                }
            }).then((data) => {
                this.study.subjectFields.push({
                    deleted: false,
                    fresh: true,
                    id: data.id,
                    name: data.name,
                    study_id: this.study.id
                });
                this.study.subjects.map((subject) => {
                    subject.entries.push({
                        fresh: true,
                        fieldId: data.id,
                        subjectId: subject.id,
                        value: "empty"
                    })
                });
                this.newFieldName = "";
            });
        }
    };

    addSubject = ()=>{
        if(this.newSubjectName.length > 0) {
            this.manageService.save({
                type: 'subject',
                data: {
                    name: this.newSubjectName,
                    study_id: this.study.id
                }
            }).then((data) => {
                this.study.subjects.push({
                    entries: this.study.subjectFields.map((field) => {
                        return {
                            fresh: false,
                            fieldId: field.id,
                            id: this.indexer--,
                            subjectId: data.id,
                            value: "empty"
                        }
                    }),
                    deleted: false,
                    fresh: false,
                    id: data.id,
                    name: data.name,
                    study_id: this.study.id
                });
            });
            this.newSubjectName = "";
        }
    };

    updateSubject = (id, name, form) => {
        if(form.$dirty) {
            this.log("saving subject")
            this.manageService.save({
                type: 'subject',
                data: {
                    id: id,
                    name: name
                }
            }).catch(e => this.logger.error(e))
            form.$setPristine();
        }
    };

    updateField = (id, name, form) => {
        if(form.$dirty) {
            this.log("saving field")
            this.manageService.save({
                type: 'field',
                data: {
                    id: id,
                    name: name
                }
            }).catch(e=>this.logger.error(e))
            form.$setPristine();
        }
    };

    updateEntry = (sidx, eidx, value, form) => {
        if(form.$dirty) {
            this.log("saving entry")
            let entry = this.study.subjects[sidx].entries[eidx];
            let obj = (entry.id > 0) ?
                {
                    id: entry.id,
                    value: value
                } :
                {
                    subject_id: entry.subjectId,
                    subjectField_id: entry.fieldId,
                    value: value
                }
            this.manageService.save({type: 'entry', data: obj}).then((entry)=>{
                this.study.subjects[sidx].entries[eidx] = entry;
            }).catch(this.err);
            form.$setPristine();
        }
    };

    deleteSubject = (id, name) => {
        if(confirm("Delete '" + name + "'?")) {
            this.manageService.delete({type: 'subject', id:id}).then(()=>{
                this.manageService.getStudy(this.study.id).then((study)=>{
                    this.study = study;
                })
            })
        }
    };

    deleteSubjectField = (id, name) => {
        if(confirm("Delete '" + name + "'?")) {
            this.manageService.delete({type: 'field', id:id}).then(()=>{
                this.manageService.getStudy(this.study.id).then((study)=>{
                    this.study = study;
                })
            })
        }
    };

    buildToMap1 = () =>{
        if(confirm("Commit and continue to mapping?")){
            this.study.stage = Stage.firstMap;
            this.manageService.save({
                type: 'study',
                data: {id: this.study.id, stage : this.study.stage}
            }).then(()=>{
                this.state.go('map1', {name: this.study.name, study: this.study});
            });
        }
    }
}

//module.exports = ManageController;
