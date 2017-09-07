import _controller from './_participateUser'

export default class extends _controller{
    constructor(a,b,c,d){
        super(a,b,c,d);
    }
    selectSubject = (id:number) =>{
        this.state.go('answerQuestions', {id: this.study.id, subId: id});
    };
}