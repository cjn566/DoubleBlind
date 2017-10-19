

import {Model, Study} from "../interfaces/Istudy";
import _controller from './AbstractStudy'

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}

    newQuestion:string = "";
    newSubject:string = "";
    addSubject = ()=>{
        if(this.newSubject.length > 0) {
            this.dataService.save({
                type: Model.subject,
                data: {
                    name: this.newSubject,
                    study_id: this.study.id
                }
            }).then((data) => {
                this.study.subjects.push(data);
            }).catch(this.err);
            this.newSubject = "";
            document.getElementById("newSubject").focus();
        }
    };

    updateSubject = (id, name, form) => {
        if(form.$dirty) {
            this.dataService.save({
                type: Model.subject,
                data: {
                    id: id,
                    name: name
                }
            }).catch(e => this.$log.error(e));
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
            this.dataService.save({
                type: Model.question,
                data: {
                    name: this.newQuestion,
                    study_id: this.study.id
                }
            }).then((data) => {
                this.study.questions.push(data);
            });
            this.newQuestion = "";
            document.getElementById("newQuestion").focus();
        }
    };

    updateQuestion = (id, name, form) => {
        if(form.$dirty) {
            this.dataService.save({
                type: Model.question,
                data: {
                    id: id,
                    name: name
                }
            }).catch(e => this.$log.error(e));
            form.$setPristine();
        }
    };

    deleteQuestion = (question, idx) => {
        this.log("delete " + idx);
        if(confirm("Delete '" + question.name + "'?")) {
            this.dataService.delete({type: Model.question, id:question.id}).then(()=>{
                this.study.questions.splice(idx, 1);
            })
        }
    };


    buildToMap1 = () =>{
        if(confirm("Save changes and begin to alias?")){
            this.state.go('map1', {name: this.study.name, study: this.study});
        }
    }
}

//module.exports = ManageController;
