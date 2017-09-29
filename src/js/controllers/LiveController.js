"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _studyController_1 = require("./abstract/_studyController");
const Istudy_1 = require("../interfaces/Istudy");
class default_1 extends _studyController_1.default {
    constructor(a, b, c, d) {
        super(a, b, c, d);
        this.finish = () => {
            if (confirm("Finish Trial?")) {
                this.dataService.save({
                    type: Istudy_1.Model.study,
                    data: {
                        id: this.id,
                        stage: Istudy_1.Stage.concluded
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