import _controller from './AbstractJoin'

export default class extends _controller{
    subjectList;
    constructor(a,b,c,d, subjectList){
        super(a,b,c,d);
        this.subjectList = subjectList;
    }
    selectSubject = (id:number) =>{
        this.state.go('join.answer', {subId: id, subject: this.subjectList[this.subjectList.findIndex( e => e.id === id)]});
    };
}