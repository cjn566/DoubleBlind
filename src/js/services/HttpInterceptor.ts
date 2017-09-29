

export default class {

    $q;
    $rootScope;
    $location;

    constructor($q, $rootScope, $location) {
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$location = $location;
    }

    responseError = (rej)=>{
        if(rej.status ===401){ // Not logged in
            console.log(rej);
            this.$location.url(rej.data);
            return this.$q.reject(rej);
        }
        return this.$q.reject(rej);
    }
}