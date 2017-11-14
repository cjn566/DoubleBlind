import {Model, Stage, Experiment} from "../../../common/interfaces/experiment";

import _controller from './AbstractExperiment'
import {shuffle} from "../../Misc";

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
        shuffle(this.experiment.subjects.map(s=>s.map1)).map((e, i)=>{
            this.experiment.subjects[i].map2 = e;
        });
    };

    map2BackToMap1 = ()=>{
        if(confirm("Discard second map and return to first map?")){
            this.state.go('map1', {id: this.experiment.id, experiment: this.experiment});
        }
    };

    map2toStartTrial = ()=>{
        if(confirm("Begin Trial?")){
            this.experiment.stage = Stage.live;
            this.dataService.save([{
                type: Model.experiment,
                data: {
                    id: this.experiment.id,
                    stage: this.experiment.stage
                }}, ...this.experiment.subjects.map((s)=>{
                    return {
                        type: Model.subject,
                        data: {
                            id: s.id,
                            map2: s.map2
                        }}
            })]).then(()=>{
                    this.state.go('live', {id:this.experiment.id, experiment: this.experiment})
                })
        }
    }
}