import {Model, Stage, Experiment} from "../../../common/interfaces/experiment";
import {invalid, resetValidations} from "../../Misc";

export default class{
    $log;
    dataService;
    state;
    params;
    experiment;
    subject;
    reqs = [];
    preReqs;
    answers;
    complete = false;

    constructor(log, dataService, state, params, experiment, answers, $scope) {
        this.$log = log;
        this.dataService = dataService;
        this.state = state;
        this.params = params;
        this.experiment = experiment;
        this.answers = answers;

        switch (experiment.stage){
            case Stage.build:
                return state.go('not-live');
            case Stage.concluded:
                return state.go('is-concluded');
        }


        this.experiment.preQuestions.map((e)=>{e.locked = false});

        // assign answers to questions
        answers.filter(e => (e.subject_id == -1)).map((a)=>{
            let x = this.experiment.preQuestions.find((q)=>{return q.id == a.question_id})
            x.answer = a.value;
            x.locked = experiment.lock_responses;
        });

        // Get list of required questions
        let preIdx = experiment.preQuestions.sort(e => !e.required).findIndex(e => !e.required);
        let idx = experiment.questions.sort(e => !e.required).findIndex(e => !e.required);
        if(preIdx > 0 )
            this.preReqs = experiment.preQuestions.slice(0, preIdx);
        if(idx > 0 )
            this.reqs = experiment.questions.slice(0, idx);

        if(this.reqs.length > 0)
            this.complete = this.updateCompletedSubjects();

        if(this.checkPreAnswers().length)
            this.state.go('join.prelim');
        else this.state.go('join.select');
        this.loadSubject(params.subId)
    }

    updateCompletedSubjects = ():boolean => {
        this.experiment.subjects.map((s)=>{
            let As = this.answers.filter((a)=>{
                return a.subject_id == s.id;
            });

            if (!this.reqs.some((q) => {
                return !As.some((a) => {
                    return a.question_id == q.id;
                })
            })){
                s['complete'] = true;
            } else {
                s['complete'] = false;
            }
        });
        return !this.experiment.subjects.some(s => !s.complete)
    };

    updatePreAnswers = () => {
        resetValidations(['prequestion']);
        if(this.preReqs.some(q=>!q.answer))
            invalid('prequestion', 'Please answer all required questions.');
        else {
            this.dataService.saveAnswer(this.experiment.preQuestions
                .filter((q) => {
                    return q.answer != null
                })
                .map((Q) => {
                    return {
                        experiment_id: Q.experiment_id,
                        question_id: Q.id,
                        subject_id: -1,
                        value: Q.answer
                    }
                })
            ).then((data) => {
                this.newAnswerSet(data);
                let unansweredReqs = this.checkPreAnswers();
                if (unansweredReqs.length) {
                    // Highlight remaining preReqs
                    console.log("there is at least one unanswered required prequestions");
                }
                else
                    this.state.go('join.select')
            }).catch(this.err);
        }
    };

    updateAnswers = () => {
        resetValidations(['question']);
        if(this.reqs.some(q=>!q.answer))
            invalid('question', 'Please answer all required questions.');
        else {
            let subId = this.subject.id;
            this.dataService.saveAnswer(this.experiment.questions
                .filter((q) => {
                    return q.answer
                })
                .map((Q) => {
                    return {
                        experiment_id: Q.experiment_id,
                        question_id: Q.id,
                        subject_id: subId,
                        value: Q.answer
                    }
                })).then((data) => {
                this.newAnswerSet(data);
                this.complete = this.updateCompletedSubjects();
                this.state.go('join.select');
            }).catch(this.err);
        }
    };

    loadSubject = (id:number) => {
        if(id) {
            this.subject = this.experiment.subjects.find((e) => {
                return e.id == id;
            });
            let subAnswers = this.answers.filter((e)=>{return e.subject_id == id});
            this.experiment.questions.map((q)=>{
                let answer = subAnswers.find((e)=>{return e.question_id == q.id});
                if(answer) {
                    q.answer = answer.value;
                    q.locked = this.experiment.lock_responses;
                }
                else {
                    q.answer = "";
                    q.locked = false;
                }
            });

            this.state.go('join.answer', {subId: id});
        }
    };

    newAnswerSet = (newAnswers) => {
        newAnswers.map((nue)=>{
            let idx = this.answers.findIndex((old)=>{return (old.question_id === nue.question_id)&&(old.subject_id === nue.subject_id)});
            if(idx != -1)
                this.answers.splice(idx, 1);
        });
        this.answers = this.answers.concat(newAnswers);
    };

    checkPreAnswers = () => { return this.preReqs.some(q => q.answer) };

    log=(m)=>{this.$log.log(m)};
    err=(e)=>{this.$log.error(e)};
}