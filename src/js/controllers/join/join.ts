import {Model, Study} from "../../interfaces/Istudy";

export default class{
    $log;
    dataService;
    state;
    params;
    study;
    subject;

    constructor(log, dataService, state, params, study, $scope) {
        this.$log = log;
        this.dataService = dataService;
        this.state = state;
        this.params = params;
        this.study = study;
        if(params.subId){
            this.subject = study.subjects.filter((e)=>{return e.id == params.subId})[0];
        }
    }

    updateAnswer = (id: number, answer: string, form) => {
        if(form.$dirty) {
            this.dataService.save([{
                type: Model.answer,
                data: {
                    study_id: this.study.id,
                    question_id: id,
                    subject_id: this.subject.id,
                    value: answer
                }
            }]).catch(e => this.err(e));
            form.$setPristine();
        }
    };

    selectSubject = (id:number) =>{
        this.state.go('join.answer', {subId: id});
    };

    log = (m) => {this.$log.log(m)};
    err = (e)=>{this.$log.error(e)};
}