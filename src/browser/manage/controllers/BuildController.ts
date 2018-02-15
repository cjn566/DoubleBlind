

import {Model, Experiment, Stage} from "../../../common/interfaces/experiment";
import _controller from './AbstractExperiment'
import {invalid, resetValidations, shuffle} from "../../Misc";
import subject from './Subjects'


declare let $: any;

export default class {
    constructor(root){

        let finish = (exp) => {
            this.experiment = exp;
            this.eLockResponses = $('#lock-check');
            this.eLockResponses.prop( "checked", this.experiment.lock_responses);
            this.nextText = this.steps[0].nextText();
            this.aliasString = "" + exp.aliases;
        };

        this.root = root;
        if(root.params.experiment) {
            finish(root.params.experiment)
        }
        else {
            root.dataService.getExperimentForOwner(root.params.id).then(finish);
        }
    }

    togglecheck = () => {
        this.experiment.lock_responses = this.eLockResponses.checked;
    };

    root;
    experiment: Experiment;
    newQuestion:string = "";
    newPreQuestion:string = "";
    newSubject:string = "";
    step = 0;
    nextText;

    eLockResponses;
    aliasString:string;

    checkSetup = () => {
        this.experiment.aliases = parseInt(this.aliasString);

        // Must be at least one question to ask participants
        if(this.experiment.questions.length == 0){
            return Promise.resolve(0);
        }

        return this.saveSetup().then(()=>{
            return 1;
        });
    };

    checkSubjects = () => {

        if (this.experiment.subjects.length === 0) {
            alert("Must have at least one "+ this.experiment.moniker + ".");
            return 0;
        }

        if (this.experiment.aliases > 0 && this.experiment.subjects.length === 1) {
            alert("It would not make any sense to have a blind trial with only one "+ this.experiment.moniker + ".");
            return 0;
        }

        if (this.experiment.aliases > 0 && this.experiment.subjects.some((s) => {
                    return !s.map1
                })){
            alert("Must not leave blank aliases");
            return 0;
        }

        return this.saveMap1().then(()=>{
            return 1 + (this.experiment.aliases == 2? 0 : 1);
        });

    };

    checkMap = () => {
        if (this.experiment.subjects.some((s) => {
                return !s.map2
            })){
            alert("Must not leave blank aliases");
            return 0;
        }

        return this.saveMap2().then(()=>{
            return 1;
        });
    };

    startTrial = () => {
        return this.root.dataService.save(
            [{
                type: Model.experiment,
                data: {
                    id: this.experiment.id,
                    stage: Stage.live
                }
            }]
        ).then(()=>{
            this.root.state.go('live', {id:this.experiment.id});
        })
    };

    steps = [
        {
            name: 'build.setup',
            nextText: ()=>{return 'Add ' + this.experiment.plural},
            nextFunction: this.checkSetup
        },
        {
            name: 'build.subjects',
            nextText: ()=>{return this.experiment.aliases == 2? "Rename " + this.experiment.plural : "Start"},
            nextFunction: this.checkSubjects
        },
        {
            name: 'build.map',
            nextText: ()=>{return 'Start'},
            nextFunction: this.checkMap
        }
    ];


    addSubject = ()=>{
        resetValidations(['subject']);
        if(this.experiment.subjects.some((e)=>{return e.text === this.newSubject})){
            return invalid('subject', 'That subject already exists.')
        }
        if(this.newSubject.length > 0) {
            this.experiment.subjects.push({
                id: -1,
                text: this.newSubject,
                displayname: '',
                map1: '',
                map2: ''
            });
            this.newSubject = "";
            document.getElementById("newSubject").focus();
        }
    };

    deleteSubject = (subject, idx) => {
        this.log("delete " +
            "" + idx);
        confirm("Delete '" + subject.name + "'?") && this.root.dataService.delete({type: Model.subject, id:subject.id}).then(()=>{
            this.experiment.subjects.splice(idx, 1);
        })
    };

    saveMap1 = ()=>{
        return this.root.dataService.save(this.experiment.subjects.map((s)=>{
            if (s.id > 0){
                return {
                    type: Model.subject,
                    data:{
                        id: s.id,
                        name: s.text,
                        map1: s.map1
                    }
                }
            }
            return {
                type: Model.subject,
                data:{
                    experiment_id: this.experiment.id,
                    name: s.text,
                    map1: s.map1
                }
            }
        }))
    };


    addQuestion = ()=>{
        if(this.newQuestion.length > 0) {
            this.experiment.questions.push({
                id: -1,
                text: this.newQuestion,
                required: false,
                perSubject: true
            });
            this.newQuestion = "";
            document.getElementById("newQuestion").focus();
        }
    };

    addPreQuestion = ()=>{
        if(this.newPreQuestion.length > 0) {
            this.experiment.preQuestions.push({
                id: -1,
                text: this.newPreQuestion,
                required: false,
                perSubject: false
            });
            this.newPreQuestion = "";
            document.getElementById("newPreQuestion").focus();
        }
    };

    deleteQuestion = (question, idx) => {
        this.log("delete " + idx);
        if(confirm("Delete question?")) {
            this.root.dataService.delete({type: Model.question, id:question.id}).then(()=>{
                if(question.per_subject)
                    this.experiment.questions.splice(idx, 1);
                else
                    this.experiment.preQuestions.splice(idx, 1);
            })
        }
    };

    updateMapFromUI = (subject, form)=>{
        if(form.$dirty) {
            this.log("saving mapping");
            this.updateMap(subject.id, subject.name);
            form.$setPristine();
        }
    };

    updateMap = (id, name)=>{
        this.root.dataService.save({
            type: Model.subject,
            data: {
                id: id,
                map1: name
            }
        }).catch(this.err)
    };

    clearAll = () =>{

    };

    copyScramble = ()=> {
        shuffle(this.experiment.subjects.map(s=>s.map1)).map((e, i)=>{
            this.experiment.subjects[i].map2 = e;
        });
    };

    saveMap2 = ()=>{
        if(confirm("Begin Trial?")){
            return this.root.dataService.save(
                this.experiment.subjects.map((s)=>{
                return {
                    type: Model.subject,
                    data: {
                        id: s.id,
                        map2: s.map2
                    }}
            }))
        }
        else return Promise.reject("nevermind");
    };


    gotoNextStep = () => {
        this.steps[this.step].nextFunction().then((next)=>{
            if (next){
                this.step += next;
                if(this.step == 3){
                    return this.startTrial();
                }
                this.root.state.go(this.steps[this.step].name);
                this.nextText = this.steps[this.step].nextText();
            }
        });
    };

    goBackAStep = () => {
        if(this.step > 0) {
            this.step--;
            this.root.state.go(this.steps[this.step].name);
            this.nextText = this.steps[this.step].nextText();
        } else {
            this.root.state.go('home');
        }
    };

    saveSetup = () =>{
            let saves = [];
            saves.push({
                type: Model.experiment,
                data: {
                    id: this.experiment.id,
                    name: this.experiment.name,
                    moniker:this.experiment.moniker,
                    plural:this.experiment.plural,
                    description:this.experiment.description,
                    conclusion:this.experiment.conclusion,
                    lock_responses: this.experiment.lock_responses,
                    aliases: this.experiment.aliases
                }
            });

            let oldQuestions = this.experiment.questions.filter((e)=>{ return (e.id > 0)});
            let newQuestions = this.experiment.questions.filter((e)=>{ return (e.id == -1)});
            oldQuestions = oldQuestions.concat(this.experiment.preQuestions.filter((e)=>{ return (e.id > 0)}));
            newQuestions = newQuestions.concat(this.experiment.preQuestions.filter((e)=>{ return (e.id == -1)}));

            saves = saves.concat(oldQuestions.map((s)=>{
                return {
                    type: Model.question,
                    data:{
                        id: s.id,
                        text: s.text,
                        per_subject: s.perSubject,
                        required: s.required
                    }
                }
            }));

            saves = saves.concat(newQuestions.map((s)=>{
                return {
                    type: Model.question,
                    data:{
                        experiment_id: this.experiment.id,
                        text: s.text,
                        per_subject: s.perSubject,
                        required: s.required
                    }
                }
            }));

            return this.root.dataService.save(saves);
    };

    log = (m) => {this.root.log.log(m)};
    err = (e) => {this.root.log.error(e)};
}