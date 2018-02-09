import _controller from './AbstractExperiment'

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}

    export = ()=>{this.dataService.export(this.experiment.id)}
}