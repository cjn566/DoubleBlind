"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Istudy_1 = require("../interfaces/Istudy");
const AbstractStudy_1 = require("./AbstractStudy");
class default_1 extends AbstractStudy_1.default {
    constructor(a, b, c, d) {
        super(a, b, c, d);
        this.newQuestion = "";
        this.newSubject = "";
        this.addSubject = () => {
            if (this.newSubject.length > 0) {
                this.dataService.save({
                    type: Istudy_1.Model.subject,
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
        this.updateSubject = (id, name, form) => {
            if (form.$dirty) {
                this.dataService.save({
                    type: Istudy_1.Model.subject,
                    data: {
                        id: id,
                        name: name
                    }
                }).catch(e => this.$log.error(e));
                form.$setPristine();
            }
        };
        this.deleteSubject = (subject, idx) => {
            this.log("delete " + idx);
            if (confirm("Delete '" + subject.name + "'?")) {
                this.dataService.delete({ type: Istudy_1.Model.subject, id: subject.id }).then(() => {
                    this.study.subjects.splice(idx, 1);
                });
            }
        };
        this.addQuestion = () => {
            if (this.newQuestion.length > 0) {
                this.dataService.save({
                    type: Istudy_1.Model.question,
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
        this.updateQuestion = (id, name, form) => {
            if (form.$dirty) {
                this.dataService.save({
                    type: Istudy_1.Model.question,
                    data: {
                        id: id,
                        name: name
                    }
                }).catch(e => this.$log.error(e));
                form.$setPristine();
            }
        };
        this.deleteQuestion = (question, idx) => {
            this.log("delete " + idx);
            if (confirm("Delete '" + question.name + "'?")) {
                this.dataService.delete({ type: Istudy_1.Model.question, id: question.id }).then(() => {
                    this.study.questions.splice(idx, 1);
                });
            }
        };
        this.buildToMap1 = () => {
            if (confirm("Save changes and begin to alias?")) {
                this.state.go('map1', { name: this.study.name, study: this.study });
            }
        };
    }
}
exports.default = default_1;
//module.exports = ManageController;
//# sourceMappingURL=BuildController.js.map