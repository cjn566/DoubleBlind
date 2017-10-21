import _controller from './AbstractJoin'
import {Model} from "../../interfaces/Istudy";

export default class extends _controller{
    subject;
    questionList;
    constructor(a,b,c,d, subject, questionList){
        super(a,b,c,d);
        this.subject = subject;
        this.questionList = questionList;
    }

    updateAnswer = (id: number, answer: string, form) => {
        if(form.$dirty) {
            this.dataService.save([{
                type: Model.answer,
                data: {
                    participant_id: this.user.id,
                    question_id: id,
                    subject_id: this.subject.id,
                    value: answer
                }
            }]).catch(e => this.err(e));
            form.$setPristine();
        }
    };
}