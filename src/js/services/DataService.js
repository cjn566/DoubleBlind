"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class default_1 {
    constructor(http, log) {
        this.err = (e) => { this.$log.error(e); };
        this.getStudies = () => {
            return this.$http.get('/studies').then((response) => {
                return response.data;
            }, this.err);
        };
        this.getStudy = (id) => {
            return this.$http.get('/getStudy', {
                'params': { 'id': id }
            }).then((response) => {
                return response.data;
            }, this.err);
        };
        this.save = (data) => {
            return this.$http.post('/save', data).then((response) => {
                return response.data;
            }, this.err);
        };
        this.whoami = () => {
            return this.$http.get('/whoami').then((res) => {
                return res.data;
            });
        };
        this.$http = http;
        this.$log = log;
    }
}
exports.default = default_1;
//# sourceMappingURL=DataService.js.map