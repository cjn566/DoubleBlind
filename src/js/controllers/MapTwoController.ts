import {Model, Stage, Study} from "../interfaces/Istudy";

import _controller from './AbstractStudy'

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


    copyScramble = ()=> {
        let a = this.study.subjects, m = a.length, t, i;
        this.study.subjects.map((e)=>{
            e.map2 = e.map1;
        });

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = a[m].map2;
            a[m].map2 = a[i].map2;
            a[i].map2 = t;
        }
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