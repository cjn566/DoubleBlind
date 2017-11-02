

import {DeleteBundle, SaveBundle} from "../../common/interfaces/study";

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

    getStudyForOwner = (id: number) => {
        return this.$http.get('/getStudyForOwner',
            {
                'params': {'id': id}
            }).then((response) => {
            return response.data
        }, this.err)
    };

    getStudyForParticipant = (link: string) => {
        return this.$http.get('/getStudyForParticipant',
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

    answers = (study_id: number)=>{
        return this.$http.get('/myAnswers',
            {
                'params': {'study_id': study_id}
            }).then((res)=>{return res.data})
    }

}
