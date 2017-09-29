
import * as Cookies from 'js-cookie';
import {Model} from "../interfaces/Istudy";
export default class{
    constructor(state, dataService, params){
        if(!params.id){
            console.error("No study id.");
        }
        this.studyId = params.id;
        this.state = state;
        this.dataService = dataService
    }
    state;
    user;
    studyId;
    dataService;

    submit = () =>{
        this.dataService.save({
            type: Model.participant,
            data: {
                name: this.user.name,
                study_id: this.studyId
            }
        }).then((res)=>{
            this.user.id = res.id;
            Cookies.set('user',this.user, {expires: 1});
            this.state.go('selectSubject', {id: this.studyId });
        });
    };
}