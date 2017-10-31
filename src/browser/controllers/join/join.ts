import {Model, Study} from "../../../common/interfaces/study";

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

    updateAnswers = () => {
        this.dataService.save(this.study.questions
            .filter((q)=>{return q.answer != null})
            .map((Q)=>{
            return {
                type: Model.answer,
                data:
                    {
                        study_id: this.study.id,
                        question_id: Q.id,
                        subject_id: this.subject.id,
                        value: Q.answer
                    }
            }
        })).then(()=>{
            this.state.go('join.select');
        }).catch(this.err);
    };

    selectSubject = (id:number) =>{
        this.state.go('join.answer', {subId: id});
    };

    log=(m)=>{this.$log.log(m)};
    err=(e)=>{this.$log.error(e)};
}