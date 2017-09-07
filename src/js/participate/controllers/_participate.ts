import {Model, Stage, Study} from "../../interfaces/Istudy";

export default abstract class{
    $log;
    dataService;
    state;
    id: number;
    study: Study;

    constructor(log, dataService, state, params) {
        this.dataService = dataService;
        this.$log = log;
        this.state = state;
        this.id = params.id;
        if(params.study) {
            this.study = params.study;
        }
        else {
            dataService.getStudy(params.id).then((study) => {
                this.study = study;
            });
        }
    }

    log = (m) => {this.$log.log(m)};
    err = (e)=>{this.$log.error(e)};
}