

import {Model, Experiment} from "../../../common/interfaces/experiment";
import _controller from './AbstractExperiment'
import {invalid, resetValidations} from "../../Misc";
import subject from './Subjects'

export default class extends _controller{
    constructor(a,b,c,d){
        super(a,b,c,d);
        this.Subject = subject(this.experiment);
        this.Subject.map1tomap2()
    }

    newQuestion:string = "";
    newPreQuestion:string = "";
    Subject;


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

    next = () => {
        switch(this.state.current.name){
            case 'build.name':
                this.state.go('build.setup');
                break;
            case 'build.setup':
                this.buildToMap1()
                    .then(()=>{
                        this.state.go('build.subjects');
                    });
                break;
            case 'build.subjects':
                this.state.go('build.map');
                break;
            case 'build.map':
                this.state.go('live', {'experiment':this.experiment, 'id':this.experiment.id});
                break;
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
                    moniker:this.experiment.moniker,
                    plural:this.experiment.plural,
                    description:this.experiment.description,
                    conclusion:this.experiment.conclusion,
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

            return this.dataService.save(saves);
        }
    };
}