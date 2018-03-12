
export default class {
    root;
    experiment;
    constructor(root) {
        this.root = root;
        this.experiment = root.params.experiment;
    }

    export = ()=>{this.root.dataService.export(this.experiment.id)}
}