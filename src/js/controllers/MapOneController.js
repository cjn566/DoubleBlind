"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Istudy_1 = require("../interfaces/Istudy");
const AbstractStudy_1 = require("./AbstractStudy");
class default_1 extends AbstractStudy_1.default {
    constructor(a, b, c, d) {
        super(a, b, c, d);
        this.blankScreen = false;
        this.generateNumbers = () => {
            this.study.subjects.map((s, idx) => {
                this.study.subjects[idx].map1 = idx + 1;
                this.updateMap(s.id, idx + 1);
            });
        };
        this.generateLetters = () => {
            this.study.subjects.map((s, idx) => {
                let letter = String.fromCharCode(65 + idx);
                this.study.subjects[idx].map1 = letter;
                this.updateMap(s.id, letter);
            });
        };
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
        this.map1BackToBuild = () => {
            if (confirm("Discard mapping and return to build?")) {
                this.state.go('build', { name: this.study.name, study: this.study });
            }
        };
        this.map1ToBlind = () => {
            if (!this.blankScreen)
                this.blankScreen = true;
            else
                this.state.go('map2', { id: this.study.id, study: this.study });
        };
    }
}
exports.default = default_1;
//# sourceMappingURL=MapOneController.js.map