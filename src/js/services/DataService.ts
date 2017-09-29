

export default class {

    $http;
    $log;
    constructor(http, log){
        this.$http = http;
        this.$log = log;
    }

    err = (e) => {this.$log.error(e)};
    
    getStudies = () => {
        return this.$http.get('/studies').then((response) => {
            return response.data
        }, this.err)
    };

    getStudy = (id: number) => {
        return this.$http.get('/getStudy',
            {
                'params': {'id': id}
            }
        ).then((response) => {
            return response.data
        }, this.err)
    };

    save = (data) => {
        return this.$http.post('/save', data
        ).then((response)=>{
            return response.data;
        }, this.err)
    };

    whoami = ()=>{
        return this.$http.get('/whoami').then((res) => {
            return res.data;
        });
    }

}
