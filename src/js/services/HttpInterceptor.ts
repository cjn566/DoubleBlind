

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
        console.log("before")
        console.log(this.$location)
        console.log("after")
        if(rej.status ===401){ // Not logged in
            console.log(rej);
            window.location.href = rej.data;
            return this.$q.reject(rej);
        }
        return this.$q.reject(rej);
    }
}