

import {DeleteBundle, SaveBundle} from "../../common/interfaces/experiment";

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

    getExperimentForOwner = (id: number) => {
        return this.$http.get('/getExperimentForOwner',
            {
                'params': {'id': id}
            }).then((response) => {
            return response.data
        }, this.err)
    };

    getExperimentForParticipant = (link: string) => {
        return this.$http.get('/getExperimentForParticipant',
            {
                'params': {link:link}
            }
        ).then((response) => {
            return response.data
        }, this.err)
    };

    save = (data: SaveBundle) => {
        return this.$http.post('/save', data
        ).then((response)=>{
            return response.data;
        }, this.err)
    };

    delete = (data: DeleteBundle) => {
        return this.$http.post('/delete', data
        ).then((response)=>{
            return response.data;
        }, this.err)
    };

    whoami = ()=>{
        return this.$http.get('/whoami').then((res) => {
            return res.data;
        });
    };

    answers = (experiment_id: number)=>{
        return this.$http.get('/myAnswers',
            {
                'params': {'experiment_id': experiment_id}
            }).then((res)=>{return res.data})
    }

}
