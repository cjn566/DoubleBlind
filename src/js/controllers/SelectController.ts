import {Model, Stage, Study} from "../interfaces/Istudy";
import _controller from './AbstractStudy'

export default class extends _controller{
    constructor(a,b,c,d){
        super(a,b,c,{study: true})
        this.studies = d;
    }

    studies;
    newStudyName;
    selectStudy = (id:number) =>{
        this.dataService.getStudy(id).then((study:Study)=>{
            this.log(study.stage)
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
            console.log("newstudy callback:")
            console.log(data);
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

//module.exports = SelectSubject;