import _controller from './abstract/_studyController'

export default class extends _controller{
    constructor(a,b,c,d){super(a,b,c,d)}

    finish = ()=>{this.log("Boo Yar ")}
}