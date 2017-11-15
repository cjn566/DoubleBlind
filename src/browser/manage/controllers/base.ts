
import * as jscookie from 'js-cookie';
import {autoRefresh} from "../../Misc";

export default class{
    $log;
    dataService;
    user;
    loading = true;
    state;

    constructor(log, dataService, state, cache) {
        this.dataService = dataService;
        this.$log = log;
        this.state = state;
        dataService.whoami().then((user) => {
            this.user  = user;
            this.loading = false;
        });

        autoRefresh(state,cache )
    }

    logout = ()=>{
        jscookie.remove('connect.sid');
        window.location.href = '/login.html';
    };

    goHome = ()=>{
        this.state.go('home')
    };

    log = (m) => {this.$log.log(m)};
    err = (e)=>{this.$log.error(e)};
}