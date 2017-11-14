import {Model, Stage, Experiment} from "../../../common/interfaces/experiment";

export default class{
    $log;
    dataService;
    state;
    params;
    experiment;
    subject;

    constructor(log, dataService, state, params, experiment, $scope) {
        this.$log = log;
        this.dataService = dataService;
        this.state = state;
        this.params = params;
        this.experiment = experiment;
        /*
        switch (experiment.stage){
            case Stage.build:
                state.go('not-live');
                break;
            case Stage.concluded:
                state.go('is-concluded');
                break;
        }
        */
        let reqs = experiment.preQuestions.filter( e => e.required).map(e=>e.id);


        if(params.subId){
            this.subject = experiment.subjects.find((e)=>{return e.id == params.subId});
        }
    }

    updatePreAnswers = () => {
        this.dataService.save(this.experiment.preQuestions
            .filter((q)=>{return q.answer != null})
            .map((Q)=>{
                return {
                    type: Model.answer,
                    data:
                        {
                            experiment_id: this.experiment.id,
                            question_id: Q.id,
                            subject_id: this.subject.id,
                            value: Q.answer
                        }
                }
            })).then(()=>{
            this.state.go('join.select');
        }).catch(this.err);
    };

    updateAnswers = () => {
        this.dataService.save(this.experiment.questions
            .filter((q)=>{return q.answer != null})
            .map((Q)=>{
            return {
                type: Model.answer,
                data:
                    {
                        experiment_id: this.experiment.id,
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