"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractStudy_1 = require("./AbstractStudy");
const study_1 = require("../interfaces/study");
class default_1 extends AbstractStudy_1.default {
    constructor(a, b, c, d) {
        super(a, b, c, d);
        this.finish = () => {
            if (confirm("Finish Trial?")) {
                this.dataService.save({
                    type: study_1.Model.study,
                    data: {
                        id: this.id,
                        stage: study_1.Stage.concluded
                    }
                }).then(() => {
                    this.state.go('concluded', { id: this.id, study: this.study });
                });
            }
        };
    }
}
exports.default = default_1;
//# sourceMappingURL=LiveController.js.map