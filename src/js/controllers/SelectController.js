"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Istudy_1 = require("../interfaces/Istudy");
const AbstractStudy_1 = require("./AbstractStudy");
class default_1 extends AbstractStudy_1.default {
    constructor(a, b, c, d) {
        super(a, b, c, { study: true });
        this.selectStudy = (id) => {
            this.dataService.getStudy(id).then((study) => {
                this.log(study.stage);
                switch (study.stage) {
                    case Istudy_1.Stage.build:
                        this.state.go('build', { id: id, study: study });
                        break;
                    case Istudy_1.Stage.live:
                        this.state.go('live', { id: id, name: study.name });
                        break;
                    case Istudy_1.Stage.concluded:
                        this.state.go('concluded', { id: id, name: study.name });
                        break;
                }
            });
        };
        this.newStudy = () => {
            this.dataService.save({
                type: Istudy_1.Model.study,
                data: { name: this.newStudyName, stage: 0 }
            }).then((data) => {
                console.log("newstudy callback:");
                console.log(data);
                this.state.go('build', { studyId: data.id });
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