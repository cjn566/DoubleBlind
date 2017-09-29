import _controller from './abstract/_participateUser'
import {Model} from "../interfaces/Istudy";

export default class extends _controller{
    constructor(a,b,c,d){
        super(a,b,c,d);
        this.subjectId = d.subId;
        console.log(this.user.id);
    }
    user;
    subjectId;

    updateAnswer = (id: number, answer: string, form) => {
        if(form.$dirty) {
            this.dataService.save({
                type: Model.answer,
                data: {
                    participant_id: this.user.id,
                    question_id: id,
                    subject_id: this.subjectId,
                    value: answer
                }
            }).catch(e => this.$log.error(e));
            form.$setPristine();
        }
    };
}