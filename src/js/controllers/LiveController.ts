
import _controller from './abstract/_studyController'
import {Model, Stage} from "../interfaces/Istudy";

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}

    finish = ()=>{
        if(confirm("Finish Trial?")){
            this.dataService.save({
                type: Model.study,
                data: {
                    id: this.id,
                    stage: Stage.concluded
                }}).then(()=>{
                    this.state.go('concluded', {id:this.id, study: this.study})
                })
        }
    }
}