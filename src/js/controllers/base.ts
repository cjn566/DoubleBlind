
import * as jscookie from 'js-cookie';

export default class{
    $log;
    dataService;
    user;
    loading = true;

    constructor(log, dataService) {
        this.dataService = dataService;
        this.$log = log;
        dataService.whoami().then((user) => {
            this.user  = user;
            this.loading = false;
        });
    }

    logout = ()=>{
        jscookie.remove('connect.sid');
        window.location.href = '/getredirected';
    };

    log = (m) => {this.$log.log(m)};
    err = (e)=>{this.$log.error(e)};
}