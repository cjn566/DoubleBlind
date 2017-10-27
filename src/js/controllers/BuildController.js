"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const study_1 = require("../interfaces/study");
const AbstractStudy_1 = require("./AbstractStudy");
class default_1 extends AbstractStudy_1.default {
    constructor(a, b, c, d) {
        super(a, b, c, d);
        this.newQuestion = "";
        this.newPreQuestion = "";
        this.newSubject = "";
        this.addSubject = () => {
            if (this.newSubject.length > 0) {
                this.dataService.save([{
                        type: study_1.Model.subject,
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
        this.updateSubject = (id, name, form) => {
            if (form.$dirty) {
                this.dataService.save([{
                        type: study_1.Model.subject,
                        data: {
                            id: id,
                            name: name
                        }
                    }]).catch(e => this.$log.error(e));
                form.$setPristine();
            }
        };
        this.deleteSubject = (subject, idx) => {
            this.log("delete " + idx);
            if (confirm("Delete '" + subject.name + "'?")) {
                this.dataService.delete({ type: study_1.Model.subject, id: subject.id }).then(() => {
                    this.study.subjects.splice(idx, 1);
                });
            }
        };
        this.addQuestion = () => {
            if (this.newQuestion.length > 0) {
                this.dataService.save([{
                        type: study_1.Model.question,
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
        this.addPreQuestion = () => {
            if (this.newPreQuestion.length > 0) {
                this.dataService.save([{
                        type: study_1.Model.question,
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
        this.updateQuestion = (id, name, form) => {
            if (form.$dirty) {
                this.dataService.save([{
                        type: study_1.Model.question,
                        data: {
                            id: id,
                            question: name
                        }
                    }]).catch(e => this.$log.error(e));
                form.$setPristine();
            }
        };
        this.deleteQuestion = (question, idx) => {
            this.log("delete " + idx);
            if (confirm("Delete '" + question.question + "'?")) {
                this.dataService.delete({ type: study_1.Model.question, id: question.id }).then(() => {
                    if (question.per_subject)
                        this.study.questions.splice(idx, 1);
                    else
                        this.study.preQuestions.splice(idx, 1);
                });
            }
        };
        this.buildToMap1 = () => {
            if (confirm("Save changes and begin to alias?")) {
                this.dataService.save({ type: study_1.Model.study,
                    data: {
                        id: this.study.id,
                        name: this.study.name,
                        anon_participants: this.study.anonParts,
                        lock_responses: this.study.lockResponses
                    } })
                    .then((data) => {
                    this.state.go('subjects', { name: this.study.name, study: this.study });
                });
            }
        };
    }
}
exports.default = default_1;
//module.exports = ManageController;
//# sourceMappingURL=BuildController.js.map