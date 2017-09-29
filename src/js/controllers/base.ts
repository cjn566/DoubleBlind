
export default class{
    $log;
    dataService;
    user;

    constructor(log, dataService) {
        this.dataService = dataService;
        this.$log = log;
        dataService.whoami().then((user) => {
            this.user  = user;
        });
    }

    log = (m) => {this.$log.log(m)};
    err = (e)=>{this.$log.error(e)};
}