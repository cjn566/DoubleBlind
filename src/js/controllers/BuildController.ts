

import {Model, Study} from "../interfaces/study";
import _controller from './AbstractStudy'

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}

    newQuestion:string = "";
    newPreQuestion:string = "";
    newSubject:string = "";

    addSubject = ()=>{
        if(this.newSubject.length > 0) {
            this.dataService.save([{
                type: Model.subject,
                data: {
                    name: this.newSubject,
                    study_id: this.study.id
                }
            }]).then((data) => {
                this.study.subjects.push(...data);
            }).catch(this.err);
            this.newSubject = "";
            document.getElementById("newSubject").focus();
        }
    };

    updateSubject = (id, name, form) => {
        if(form.$dirty) {
            this.dataService.save([{
                type: Model.subject,
                data: {
                    id: id,
                    name: name
                }
            }]).catch(e => this.$log.error(e));
            form.$setPristine();
        }
    };

    deleteSubject = (subject, idx) => {
        this.log("delete " + idx);
        if(confirm("Delete '" + subject.name + "'?")) {
            this.dataService.delete({type: Model.subject, id:subject.id}).then(()=>{
                this.study.subjects.splice(idx, 1);
            })
        }
    };



    addQuestion = ()=>{
        if(this.newQuestion.length > 0) {
            this.dataService.save([{
                type: Model.question,
                data: {
                    question: this.newQuestion,
                    study_id: this.study.id,
                    per_subject: true,
                    required: true
                }
            }]).then((data) => {
                this.study.questions.push(...data);
            });
            this.newQuestion = "";
            document.getElementById("newQuestion").focus();
        }
    };

    addPreQuestion = ()=>{
        if(this.newPreQuestion.length > 0) {
            this.dataService.save([{
                type: Model.question,
                data: {
                    question: this.newPreQuestion,
                    study_id: this.study.id,
                    per_subject: false,
                    required: true
                }
            }]).then((data) => {
                this.study.preQuestions.push(...data);
            });
            this.newPreQuestion = "";
            document.getElementById("newPreQuestion").focus();
        }
    };

    updateQuestion = (id, name, form) => {
        if(form.$dirty) {
            this.dataService.save([{
                type: Model.question,
                data: {
                    id: id,
                    question: name
                }
            }]).catch(e => this.$log.error(e));
            form.$setPristine();
        }
    };

    deleteQuestion = (question, idx) => {
        this.log("delete " + idx);
        if(confirm("Delete '" + question.question + "'?")) {
            this.dataService.delete({type: Model.question, id:question.id}).then(()=>{
                if(question.per_subject)
                    this.study.questions.splice(idx, 1);
                else
                    this.study.preQuestions.splice(idx, 1);
            })
        }
    };


    buildToMap1 = () =>{
        if(confirm("Save changes and begin to alias?")){

            this.dataService.save({type: Model.study,
                data:
                    {
                        id: this.study.id,
                        name: this.study.name,
                        anon_participants: this.study.anonParts,
                        lock_responses: this.study.lockResponses
                    }})
                .then((data)=>{
                    this.state.go('subjects', {name: this.study.name, study: this.study});
                });
        }
    }
}

//module.exports = ManageController;
