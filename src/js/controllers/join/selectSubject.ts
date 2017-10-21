import _controller from './AbstractJoin'

export default class extends _controller{
    subjectList;
    answers;
    constructor(a,b,c,d, subjectList, answers){
        super(a,b,c,d);
        this.subjectList = subjectList;
        this.answers = answers;
    }
    selectSubject = (id:number) =>{
        this.state.go('join.answer', {subId: id, subject: this.subjectList[this.subjectList.findIndex( e => e.id === id)]});
    };
}