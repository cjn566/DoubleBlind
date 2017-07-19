import {Model, Stage, Study} from "../interfaces/Istudy";

export default class {
    logger;
    mapService;
    state;

    constructor(log, mapService, state, params) {
        this.mapService = mapService;
        this.logger = log;
        this.state = state;
        this.study = params.study;
    }

    study: Study;

    log = (m) => {
        this.logger.log(m);
    };

    generateNumbers = ()=>{
        this.study.subjects.map((s, idx)=>{
            this.study.subjects[idx].map1 = idx+1;
            this.updateMap(s.id, idx+1);
        })
    }

    generateLetters = ()=>{
        this.study.subjects.map((s, idx)=>{
            let letter = String.fromCharCode(65 + idx);
            this.study.subjects[idx].map1 = letter;
            this.updateMap(s.id, letter);
        })
    }

    updateMapFromUI = (id, name, form)=>{
        if(form.$dirty) {
            this.log("saving mapping");
            this.updateMap(id, name);
            form.$setPristine();
        }
    };

    updateMap = (id, name)=>{
        this.mapService.save({
            type: Model.subject,
            data: {
                id: id,
                map1: name
            }
        }).catch(e=>this.logger.error(e))
    };

    scramble = () =>{
        this.log(this.shuffle(this.study.subjects.map(s=>s.map1)))
    }

    shuffle = (array)=> {
        let m = array.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return array;
    };

    map1BackToBuild = ()=>{
        if(confirm("Discard mapping and return to build?")){
            this.study.stage = Stage.build;
            this.mapService.save({
                type: Model.study,
                data: {id: this.study.id, stage : this.study.stage}
            }).then(()=>{
                this.state.go('build', {name: this.study.name, study: this.study});
            });
        }
    };

    map1ToBlind = ()=>{

    }
}