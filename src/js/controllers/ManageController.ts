

import {Model, Stage, Study} from "../interfaces/Istudy";

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

    newQuestion:string = "";
    newSubject:string = "";
    study: Study;

    log = (m)=>{
        this.logger.log(m);
    };

    err = (e)=>{this.logger.error(e)};

    addSubject = ()=>{
        if(this.newSubject.length > 0) {
            this.manageService.save({
                type: Model.subject,
                data: {
                    name: this.newSubject,
                    study_id: this.study.id
                }
            }).then((data) => {
                this.study.subjects.push({data});
            });
            this.newSubject = "";
            
        }
    };

    updateSubject = (id, name, form) => {
        if(form.$dirty) {
            this.log("saving subject")
            this.manageService.save({
                type: Model.subject,
                data: {
                    id: id,
                    name: name
                }
            }).catch(e => this.logger.error(e))
            form.$setPristine();
        }
    };

    deleteSubject = (id, name) => {
        if(confirm("Delete '" + name + "'?")) {
            this.manageService.delete({type: Model.subject, id:id}).then(()=>{
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
                type: Model.study,
                data: {id: this.study.id, stage : this.study.stage}
            }).then(()=>{
                this.state.go('map1', {name: this.study.name, study: this.study});
            });
        }
    }
}

//module.exports = ManageController;
