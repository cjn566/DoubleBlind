

import {DeleteBundle, SaveBundle} from "../../../common/interfaces/experiment";

export default class {

    $http;
    $log;
    constructor(http, log){
        this.$http = http;
        this.$log = log;
    }

    err = (e) => {this.$log.error(e)};

    getExperimentForParticipant = (link: string) => {
        return this.$http.get('/blorp/getExperimentForParticipant',
            {
                'params': {link:link}
            }
        ).then((response) => {
            return response.data
        }, this.err)
    };

    saveAnswer = (data: SaveBundle) => {
        return this.$http.post('/blorp/saveAnswer', data
        ).then((response)=>{
            return response.data;
        }, this.err)
    };

    getAnswers = (experiment_id: number)=>{
        return this.$http.get('/blorp/myAnswers',
            {
                'params': {'experiment_id': experiment_id}
            }).then((res)=>{return res.data})
    };
}
