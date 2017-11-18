

import {Model, Experiment} from "../../../common/interfaces/experiment";
import _controller from './AbstractExperiment'
import {invalid, resetValidations} from "../../Misc";

export default class extends _controller{
    constructor(a,b,c,d){
        super(a,b,c,d);
    }

    newQuestion:string = "";
    newPreQuestion:string = "";

    addQuestion = ()=>{
        if(this.newQuestion.length > 0) {
            this.experiment.questions.push({
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
            this.experiment.preQuestions.push({
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
                    this.experiment.questions.splice(idx, 1);
                else
                    this.experiment.preQuestions.splice(idx, 1);
            })
        }
    };


    buildToMap1 = () =>{
        if(true){//confirm("Save changes and begin adding subjects?")){

            let saves = [];
            saves.push({
                type: Model.experiment,
                data: {
                    id: this.experiment.id,
                    name: this.experiment.name,
                    anon_participants: this.experiment.anon_participants,
                    lock_responses: this.experiment.lock_responses,
                    aliases: this.experiment.aliases
                }
            });

            let oldQuestions = this.experiment.questions.filter((e)=>{ return (e.id > 0)});
            let newQuestions = this.experiment.questions.filter((e)=>{ return (e.id == -1)});
            oldQuestions = oldQuestions.concat(this.experiment.preQuestions.filter((e)=>{ return (e.id > 0)}));
            newQuestions = newQuestions.concat(this.experiment.preQuestions.filter((e)=>{ return (e.id == -1)}));

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
                        experiment_id: this.experiment.id,
                        text: s.text,
                        per_subject: s.perSubject,
                        required: s.required
                    }
                }
            }));

            this.dataService.save(saves)
                .then(()=>{
                    this.state.go('build.subjects', {id: this.experiment.id, experiment: this.experiment});
                });
        }
    };
}