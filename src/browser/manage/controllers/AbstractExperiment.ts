import {Model, Stage, Experiment} from "../../../common/interfaces/experiment";

export default abstract class{
    $log;
    dataService;
    state;
    id: number;
    experiment: Experiment;

    constructor(log, dataService, state, params, callback?) {
        this.dataService = dataService;
        this.$log = log;
        this.state = state;
        this.id = params.id;
        if(params.experiment) {
            this.experiment = params.experiment;
            if(typeof callback == 'function') callback();
        }
        else {
            dataService.getExperimentForOwner(params.id).then((experiment) => {
                this.experiment = experiment;
                if(typeof callback == 'function') callback();
            });
        }
    }

    log = (m) => {this.$log.log(m)};
    err = (e) => {this.$log.error(e)};

}