

import {Model, Study} from "../../common/interfaces/study";
import _controller from './AbstractStudy'
import {invalid, resetValidations} from "../Misc";

export default class extends _controller{
    constructor(a,b,c,d){
        super(a,b,c,d);
    }

    newQuestion:string = "";
    newPreQuestion:string = "";

    addQuestion = ()=>{
        if(this.newQuestion.length > 0) {
            this.study.questions.push({
                id: -1,
                text: this.newQuestion,
                required: false,
                perSubject: true
            });
            this.newQuestion = "";
            document.getElementById("newQuestion").focus();
        }
    };

    addPreQuestion = ()=>{
        if(this.newPreQuestion.length > 0) {
            this.study.preQuestions.push({
                id: -1,
                text: this.newPreQuestion,
                required: false,
                perSubject: false
            });
            this.newPreQuestion = "";
            document.getElementById("newPreQuestion").focus();
        }
    };

    deleteQuestion = (question, idx) => {
        this.log("delete " + idx);
        if(confirm("Delete question?")) {
            this.dataService.delete({type: Model.question, id:question.id}).then(()=>{
                if(question.per_subject)
                    this.study.questions.splice(idx, 1);
                else
                    this.study.preQuestions.splice(idx, 1);
            })
        }
    };


    buildToMap1 = () =>{
        if(true){//confirm("Save changes and begin adding subjects?")){

            let saves = [];
            saves.push({
                type: Model.study,
                data: {
                    id: this.study.id,
                    name: this.study.name,
                    anon_participants: this.study.anon_participants,
                    lock_responses: this.study.lock_responses,
                    aliases: this.study.aliases
                }
            });

            let oldQuestions = this.study.questions.filter((e)=>{ return (e.id > 0)});
            let newQuestions = this.study.questions.filter((e)=>{ return (e.id == -1)});
            oldQuestions = oldQuestions.concat(this.study.preQuestions.filter((e)=>{ return (e.id > 0)}));
            newQuestions = newQuestions.concat(this.study.preQuestions.filter((e)=>{ return (e.id == -1)}));

            saves = saves.concat(oldQuestions.map((s)=>{
                return {
                    type: Model.question,
                    data:{
                        id: s.id,
                        text: s.text,
                        per_subject: s.perSubject,
                        required: s.required
                    }
                }
            }));

            saves = saves.concat(newQuestions.map((s)=>{
                return {
                    type: Model.question,
                    data:{
                        study_id: this.study.id,
                        text: s.text,
                        per_subject: s.perSubject,
                        required: s.required
                    }
                }
            }));

            this.dataService.save(saves)
                .then(()=>{
                    this.state.go('subjects', {id: this.study.id, study: this.study});
                });
        }
    };
}