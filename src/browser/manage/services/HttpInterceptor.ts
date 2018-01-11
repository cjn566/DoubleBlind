

import {ApiCode} from "../../../common/interfaces/codes";

export default class {

    $q;
    $rootScope;
    $location;

    constructor($q, $rootScope, $location, $state) {
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$location = $location;
    }

    responseError = (rej)=>{
        console.error(rej.data.message);
        switch (rej.data.code){
            case ApiCode.notReady:

                break;
            case 403:   // Not Authorized
                console.error("You aren't allowed to access that resource.");
                break;
            case 500:   // Server Error
                console.error("The server has experienced an error. Contact Colten.");
                break;
        }
        return this.$q.reject(rej);
    }
}