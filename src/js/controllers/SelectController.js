"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const study_1 = require("../interfaces/study");
const AbstractStudy_1 = require("./AbstractStudy");
class default_1 extends AbstractStudy_1.default {
    constructor(a, b, c, d) {
        super(a, b, c, { study: true });
        this.selectStudy = (id) => {
            this.dataService.getStudyByID(id).then((study) => {
                this.log(study.stage);
                switch (study.stage) {
                    case study_1.Stage.build:
                        this.state.go('build', { id: id, study: study });
                        break;
                    case study_1.Stage.live:
                        this.state.go('live', { id: id, name: study.name });
                        break;
                    case study_1.Stage.concluded:
                        this.state.go('concluded', { id: id, name: study.name });
                        break;
                }
            });
        };
        this.newStudy = () => {
            this.dataService.save([{
                    type: study_1.Model.study,
                    data: {
                        name: this.newStudyName,
                        stage: 0,
                        anon_participants: false,
                        lock_responses: false
                    }
                }]).then((data) => {
                console.log("newstudy callback:");
                console.log(data);
                this.state.go('build', { id: data[0].id });
            });
        };
        this.deleteStudy = (id, name) => {
            if (confirm("Delete '" + name + "'?")) {
                if (confirm("Are you sure?!")) {
                    this.dataService.delete({ type: 'study', id: id }).then(() => {
                        this.dataService.getStudies().then((studies) => {
                            this.studies = studies;
                        });
                    });
                }
            }
        };
        this.studies = d;
    }
}
exports.default = default_1;
//module.exports = SelectSubject; 
//# sourceMappingURL=SelectController.js.map