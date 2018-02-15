import {Model, Stage, Experiment} from "../../../common/interfaces/experiment";
import _controller from './AbstractExperiment'
import {autoRefresh} from "../../Misc";

import * as copy from 'copy-to-clipboard';
import {options} from "../../../common/options";


export default class extends _controller{
    constructor(a,b,c,d, cache){
        super(a,b,c,{experiment: true});
        this.studies = d;
        this.studies.map((s)=>{
            s.link = "/join/" + s.id;
        });
        this.active = this.studies.filter((s)=>{return s.stage != Stage.concluded});
        this.archive = this.studies.filter((s)=>{return s.stage == Stage.concluded});

        // Dev
        //autoRefresh(this.state, cache);
    }

    active;
    archive;
    studies;
    newExperimentName;

    copyLink = (link) => {
        copy(options.address + ':' + options.port + link);
    };

    join = (link) => {
        console.log(link)
        window.open(link);
    };

    exportData = (id) => {
        this.dataService.exportData(id, true);
    }

    selectExperiment = (id:number) =>{
        this.dataService.getExperimentForOwner(id).then((experiment:Experiment)=>{
            switch (experiment.stage) {
                case Stage.build:
                    this.state.go('name', {id: id, names: {
                        name: experiment.name,
                        moniker: experiment.moniker,
                        plural: experiment.plural
                    }});
                    break;
                case Stage.live:
                    this.state.go('live', {id: id});
                    break;
                case Stage.concluded:
                    this.state.go('results', {id: id});
                    break;

            }
        })
    };

    newExperiment = () =>{
        this.state.go('name');
    };

    deleteExperiment = (id, name) => {
        if(confirm("Delete '" + name + "'?")) {
            if(confirm("Are you sure?!")) {
                this.dataService.delete({type: Model.experiment, id: id}).then(() => {
                    this.dataService.getExperiments().then((studies)=>{
                        this.studies = studies;
                    })
                })
            }
        }
    };

}

//module.exports = SelectSubject;