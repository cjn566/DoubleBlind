
import * as jscookie from 'js-cookie';
import {autoRefresh} from "../../Misc";

export default class{
    user;
    loading = true;
    root;

    constructor(root) {
        this.root  = root
        root.dataService.whoami().then((user) => {
            this.user  = user;
            this.loading = false;
        });
    }

    logout = ()=>{
        jscookie.remove('connect.sid');
        window.location.href = '/login.html';
    };

    goHome = ()=>{
        this.root.state.go('home')
    };
}