"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Istudy_1 = require("../interfaces/Istudy");
const _studyController_1 = require("./abstract/_studyController");
class default_1 extends _studyController_1.default {
    constructor(a, b, c, d) {
        super(a, b, c, d);
        this.updateMapFromUI = (subject, form) => {
            if (form.$dirty) {
                this.log("saving mapping");
                this.updateMap(subject.id, subject.name);
                form.$setPristine();
            }
        };
        this.updateMap = (id, name) => {
            this.dataService.save({
                type: Istudy_1.Model.subject,
                data: {
                    id: id,
                    map1: name
                }
            }).catch(this.err);
        };
        this.copyScramble = () => {
            let a = this.study.subjects, m = a.length, t, i;
            this.study.subjects.map((e) => {
                e.map2 = e.map1;
            });
            // While there remain elements to shuffle…
            while (m) {
                // Pick a remaining element…
                i = Math.floor(Math.random() * m--);
                // And swap it with the current element.
                t = a[m].map2;
                a[m].map2 = a[i].map2;
                a[i].map2 = t;
            }
        };
        this.map2BackToMap1 = () => {
            if (confirm("Discard second map and return to first map?")) {
                this.state.go('map1', { id: this.study.id, study: this.study });
            }
        };
        this.map2toStartTrial = () => {
            if (confirm("Begin Trial?")) {
                this.study.stage = Istudy_1.Stage.live;
                this.dataService.save({
                    type: Istudy_1.Model.study,
                    data: {
                        id: this.study.id,
                        stage: this.study.stage
                    }
                }).then(() => {
                    this.state.go('live', { id: this.study.id, study: this.study });
                });
            }
        };
    }
}
exports.default = default_1;
//# sourceMappingURL=MapTwoController.js.map