import {Model, Stage, Study} from "../../common/interfaces/study";

import _controller from './AbstractStudy'
import {shuffle} from "../Misc";

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}

    updateMapFromUI = (subject, form)=>{
        if(form.$dirty) {
            this.log("saving mapping");
            this.updateMap(subject.id, subject.name);
            form.$setPristine();
        }
    };

    updateMap = (id, name)=>{
        this.dataService.save({
            type: Model.subject,
            data: {
                id: id,
                map1: name
            }
        }).catch(this.err)
    };

    clearAll = () =>{

    }

    copyScramble = ()=> {
        shuffle(this.study.subjects.map(s=>s.map1)).map((e, i)=>{
            this.study.subjects[i].map2 = e;
        });
    };

    map2BackToMap1 = ()=>{
        if(confirm("Discard second map and return to first map?")){
            this.state.go('map1', {id: this.study.id, study: this.study});
        }
    };

    map2toStartTrial = ()=>{
        if(confirm("Begin Trial?")){
            this.study.stage = Stage.live;
            this.dataService.save({
                type: Model.study,
                data: {
                    id: this.study.id,
                    stage: this.study.stage
                }}).then(()=>{
                    this.state.go('live', {id:this.study.id, study: this.study})
                })
        }
    }
}