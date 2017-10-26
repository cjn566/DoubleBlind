

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
        switch (rej.status){
            case 401:
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