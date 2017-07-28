import {Model, Stage, Study} from "../interfaces/Istudy";

export default class {

    logger;
    dataService;
    state;
    studies;
    newStudyName;

    constructor(log, dataService, state, studies){
        this.logger = log;
        this.dataService = dataService;
        this.state = state;
        this.studies = studies;
    }

    selectStudy = (id:number) =>{
        this.dataService.getStudy(id).then((study:Study)=>{
            switch (study.stage) {
                case Stage.build:
                    this.state.go('build', {id: id, study: study});
                    break;
                case Stage.live:
                    this.state.go('live', {id: id, name: study.name});
                    break;
                case Stage.concluded:
                    this.state.go('concluded', {id: id, name: study.name});
                    break;

            }
        })
    };

    newStudy = () =>{
        this.dataService.save({
            type: Model.study,
            data: {name: this.newStudyName, stage : 0}
        }).then((data)=>{
            this.state.go('build', {studyId: data.id});
        })
    };

    deleteStudy = (id, name) => {
        if(confirm("Delete '" + name + "'?")) {
            if(confirm("Are you sure?!")) {
                this.dataService.delete({type: 'study', id: id}).then(() => {
                    this.dataService.getStudies().then((studies)=>{
                        this.studies = studies;
                    })
                })
            }
        }
    };

}

//module.exports = SelectController;