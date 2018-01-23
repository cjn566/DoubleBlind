
import _controller from './AbstractExperiment'
import {Answer, Model, Stage} from "../../../common/interfaces/experiment";

enum NumAnswered {
    none,
    justReq,
    all,
};

export default class extends _controller{
    constructor(a,b,c,d){
        super(a,b,c,d, ()=>{
            this.Qs = this.experiment.questions.length;
            this.preQs = this.experiment.preQuestions.length;
            this.reqQs = this.experiment.questions.filter((e)=>{return e.required}).length;
            this.reqPreQs = this.experiment.preQuestions.filter((e)=>{return e.required}).length;

            this.experiment.subjects.map((e)=>{
                e.displayname = this.experiment.aliases == 2? e.map2 : this.experiment.aliases == 1? e.map1 : e.name;
            })

        });

        setInterval(this.update, 2000)
    }

    Qs: number;
    preQs: number;
    reqQs: number;
    reqPreQs: number;

    answers: Answer[];
    users;


    update = ()=>{
        this.dataService.answersForHost(this.experiment.id).then((data)=>{
            this.users = [...new Set(data.map(e => e.participant_id))];
            this.answers = data;
        });
    };

    answered = (user: number, s: number = -1):NumAnswered =>{
        let num = this.answers
            .filter(e => {
                return (e.participant_id === user) && (e.subject_id === s)
            }).length;
        switch(true){
            case (num == (s == -1? this.preQs : this.Qs)):
                return NumAnswered.all;
            case (num >= (s == -1? this.reqPreQs : this.reqQs)):
                return NumAnswered.justReq;
            default:
                return NumAnswered.none;
        }
    };

    finish = ()=>{
        if(confirm("Finish Trial?")){
            this.dataService.save({
                type: Model.experiment,
                data: {
                    id: this.id,
                    stage: Stage.concluded
                }}).then(()=>{
                    this.state.go('concluded', {id:this.id, experiment: this.experiment})
                })
        }
    }
}