import {Study} from "../../interfaces/Istudy";

export default abstract class{
    $log;
    dataService;
    state;
    params;
    user;

    constructor(log, dataService, state, params) {
        this.$log = log;
        this.dataService = dataService;
        this.state = state;
        this.params = params;
        dataService.whoami().then((user)=> {this.user = user});
    }

    log = (m) => {this.$log.log(m)};
    err = (e)=>{this.$log.error(e)};
}