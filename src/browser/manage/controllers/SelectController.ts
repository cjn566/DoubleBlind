import {Model, Stage, Experiment} from "../../../common/interfaces/experiment";
import {autoRefresh} from "../../Misc";

import * as copy from 'copy-to-clipboard';
import {options} from "../../../common/options";


export default class {
    constructor(root, studies){

        this.root = root;
        this.studies = studies;
        this.studies.map((s)=>{
            s.link = "/join/" + s.id;
        });
        this.active = this.studies.filter((s)=>{return s.stage != Stage.concluded});
        this.archive = this.studies.filter((s)=>{return s.stage == Stage.concluded});

        // Dev
        //autoRefresh(this.state, cache);
    }

    root;
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
        this.root.dataService.exportData(id, true);
    }

    selectExperiment = (id:number) =>{
        this.root.dataService.getExperimentForOwner(id).then((experiment:Experiment)=>{
            switch (experiment.stage) {
                case Stage.build:
                    this.root.state.go('build.name', {id: id});
                    break;
                case Stage.live:
                    this.root.state.go('live', {id: id});
                    break;
                case Stage.concluded:
                    this.root.state.go('results', {id: id});
                    break;

            }
        })
    };

    newExperiment = () =>{
        let data = {
            name: '',
            moniker:'',
            plural:'',
            stage: 0,
            lock_responses: false,
            aliases: 0
        };

        return this.root.dataService.save({
            type: Model.experiment,
            data: data
        }).then((data)=>{
            this.root.state.go('build.name', {id:data.id});
        });
    };

    deleteExperiment = (id, name) => {
        if(confirm("Delete '" + name + "'?")) {
            if(confirm("Are you sure?!")) {
                this.root.dataService.delete({type: Model.experiment, id: id}).then(() => {
                    this.root.dataService.getExperiments().then((studies)=>{
                        this.studies = studies;
                    })
                })
            }
        }
    };

}

//module.exports = SelectSubject;