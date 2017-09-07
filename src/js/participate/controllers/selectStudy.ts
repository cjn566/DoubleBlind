import _participate from './_participate'

export default class extends _participate{
    constructor(a,b,c,d){
        super(a,b,c,{study: true});
        this.studies = d.filter(e=>e.stage == 1);
    }
    studies;

    selectStudy = (id:number) =>{
        this.state.go('selectSubject', {id: id});
    };
}