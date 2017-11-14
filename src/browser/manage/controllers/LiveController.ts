
import _controller from './AbstractExperiment'
import {Model, Stage} from "../../../common/interfaces/experiment";

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}

    finish = ()=>{
        if(confirm("Finish Trial?")){
            this.dataService.save({
                type: Model.experiment,
                data: {
                    id: this.id,
                    stage: Stage.concluded
                }}).then(()=>{
                    this.state.go('concluded', {id:this.id, experiment: this.experiment})
                })
        }
    }
}