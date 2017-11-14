

import {Model, Experiment} from "../../../common/interfaces/experiment";
import _controller from './AbstractExperiment'
import {invalid, resetValidations} from "../../Misc";

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}
    newSubject:string = "";

    addSubject = ()=>{
        resetValidations(['subject']);
        if(this.experiment.subjects.some((e)=>{return e.name === this.newSubject})){
            return invalid('subject', 'That subject already exists.')
        }
        if(this.newSubject.length > 0) {
            this.experiment.subjects.push({
                id: -1,
                name: this.newSubject,
                map1: '',
                map2: ''
            });
            this.newSubject = "";
            document.getElementById("newSubject").focus();
        }
    };

    deleteSubject = (subject, idx) => {
        this.log("delete " + idx);
        confirm("Delete '" + subject.name + "'?") && this.dataService.delete({type: Model.subject, id:subject.id}).then(()=>{
                this.experiment.subjects.splice(idx, 1);
            })
    };

    map1tomap2 = ()=>{
        if(this.experiment.aliases > 0 && this.experiment.subjects.some((s)=>{return !s.map1}))
            return alert("Must not leave blank aliases");
        this.dataService.save(this.experiment.subjects.map((s)=>{
            if (s.id > 0){
                return {
                    type: Model.subject,
                    data:{
                        id: s.id,
                        name: s.name,
                        map1: s.map1
                    }
                }
            }
            return {
                type: Model.subject,
                data:{
                    experiment_id: this.experiment.id,
                    name: s.name,
                    map1: s.map1
                }
            }
        })).then(()=>{
            this.state.go('map', {id: this.experiment.id, experiment: this.experiment})
        })
    }
}