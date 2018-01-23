

import {Model, Experiment, Stage} from "../../../common/interfaces/experiment";
import {invalid, resetValidations, shuffle} from "../../Misc";
import subject from './Subjects'

export default class {
    constructor(root){
        this.root = root;
        this.id = root.params.id;
        if(root.params.names) {
            this.names = root.params.names;
        }
        else {
            root.dataService.getNames(root.params.id).then((names) => {
                this.names = names;
            });
        }
    }

    root;
    id: number;
    names = {
        name: "",
        moniker:"",
        plural:""
    }


    continue = () =>{
        return this.root.dataService.save([{
            type: Model.experiment,
            data: {
                id: this.id,
                name: this.names.name,
                moniker:this.names.moniker,
                plural:this.names.plural
            }
        }]).then(()=>{
            this.root.state.go('build.setup', {id:this.id});
        });
    };

    log = (m) => {this.root.log.log(m)};
    err = (e) => {this.root.log.error(e)};
}