

import {DeleteBundle, SaveBundle} from "../../../common/interfaces/experiment";

export default class {

    $http;
    $log;
    constructor(http, log){
        this.$http = http;
        this.$log = log;
    }

    err = (e) => {this.$log.error(e)};
    
    getExperiments = () => {
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

    getNames = (id: number) => {
        return this.$http.get('/getNames',
            {
                'params': {'id': id}
            }).then((response) => {
            return response.data
        }, this.err)
    };

    save = (data: SaveBundle) => {
        return this.$http.get('/save', data
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

    answersForHost = (experiment_id: number) =>{
        return this.$http.get('/answersForHost', {
            'params': {'experiment_id': experiment_id}
        }).then((res)=>{return res.data})
    };

    exportData = (experiment_id: number, questionsFirst: boolean) =>{
        return this.$http.get('/export', {
            'params': {'experiment_id': experiment_id, 'questionsFirst': questionsFirst}
        })
    };

}
