
import _controller from './AbstractStudy'
import {Model, Stage} from "../../common/interfaces/study";

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