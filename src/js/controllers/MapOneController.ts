import {Model, Study} from "../interfaces/study";
import _controller from './AbstractStudy'

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}

    blankScreen = false;
    generateNumbers = ()=>{
        this.study.subjects.map((s, idx)=>{
            this.study.subjects[idx].map1 = idx+1;
            this.updateMap(s.id, idx+1);
        })
    };

    generateLetters = ()=>{
        this.study.subjects.map((s, idx)=>{
            let letter = String.fromCharCode(65 + idx);
            this.study.subjects[idx].map1 = letter;
            this.updateMap(s.id, letter);
        })
    };

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

    map1BackToBuild = ()=>{
        if(confirm("Discard mapping and return to build?")){
            this.state.go('build', {name: this.study.name, study: this.study});
        }
    };

    map1ToBlind = ()=>{
        if(!this.blankScreen)
            this.blankScreen=true;
        else
            this.state.go('map2', {id: this.study.id, study: this.study});
    }
}