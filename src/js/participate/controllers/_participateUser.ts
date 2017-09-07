import _controller from './_participate'
import {isUndefined} from "util";
import * as Cookies from 'js-cookie';

export default class extends _controller{
    constructor(a,b,c,d){
        super(a,b,c,d);
        let user = Cookies.get('user');
        if(isUndefined(user)){
            this.state.go('setName', {id: d.id});
        }
        else{
            this.user = JSON.parse(user);
        }
    }
    user;
    notMe = () => {
        Cookies.remove('name');
        this.state.go('setName', {id: this.study.id});
    }

}