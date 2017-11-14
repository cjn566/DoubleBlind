import _controller from './AbstractExperiment'

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}

    finish = ()=>{this.log("Boo Yar ")}
}