

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

    getStudyByID = (id: number) => {
        return this.$http.get('/getStudy',
            {
                'params': {'id': id}
            }
        ).then((response) => {
            return response.data
        }, this.err)
    };

    getStudyByLink = (link: string) => {
        return this.$http.get('/getStudy',
            {
                'params': {'link': link}
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

    answers = ()=>{
        return this.$http.get('/answers').then((res)=>{return res.data})
    }

}
