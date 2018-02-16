

import {Model, Experiment, Stage} from "../../../common/interfaces/experiment";
import {invalid, resetValidations, shuffle} from "../../Misc";
import subject from './Subjects'
import * as pluralize from 'pluralize';

export default class {
    constructor(root){
        this.root = root;
        if(root.params.id) {
            this.id = root.params.id;
            root.dataService.getNames(root.params.id).then((names) => {
                this.names = names;
            });
        }
    }

    root;
    id: number = null;
    names = {
        name: "",
        moniker:"",
        plural:""
    };

    continue = () =>{
        console.log(pluralize(this.names.moniker));

        let data = {
            id: this.id,
            name: this.names.name,
            moniker:this.names.moniker,
            plural:this.names.plural
        };

        if(!this.id) {
            data['stage'] = 0;
            data['lock_responses'] = false;
            data['aliases'] = 0;
        }

        return this.root.dataService.save([{
            type: Model.experiment,
            data: data
        }]).then((data)=>{
            this.root.state.go('build.setup', {id:data[0].id});
        });
    };

    log = (m) => {this.root.log.log(m)};
    err = (e) => {this.root.log.error(e)};
}