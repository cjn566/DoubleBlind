
import {Answer, Model, Stage} from "../../../common/interfaces/experiment";


export default class {
    root;
    experiment;
    constructor(root, experiment) {
        this.root = root;
        this.experiment = experiment;
        this.numSubjects = experiment.subjects.length;
        this.update();
        setInterval(this.update, 2000)
    }
    numSubjects;
    answers;

    update = ()=>{
        this.root.dataService.answersForHost(this.experiment.id).then((data)=>{

            this.answers = data.map((e, i)=>{return {id: i, value: e}});

        });
    };

    finish = ()=>{
        if(confirm("Finish Trial?")){
            this.root.dataService.save({
                type: Model.experiment,
                data: {
                    id: this.experiment.id,
                    stage: Stage.concluded
                }}).then(()=>{
                    this.root.state.go('concluded', {id:this.experiment.id, experiment: this.experiment})
                })
        }
    }
}