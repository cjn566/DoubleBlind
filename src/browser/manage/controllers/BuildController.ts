

import {Model, Experiment, Stage} from "../../../common/interfaces/experiment";
import {invalid, resetValidations, shuffle} from "../../Misc";
import * as pluralize from 'pluralize';

declare let $: any;

export default class {

    states = {
        'build.name': 0,
        'build.options': 1,
        'build.prequestions': 2,
        'build.questions': 3,
        'build.subjects': 4,
    };

    constructor(root, transitions){

        this.root = root;

        let finish = (exp) => {
            this.experiment = exp;
            this.eLockResponses = $('#lock-check');
            this.eLockResponses.prop( "checked", this.experiment.lock_responses);
            this.nameString = exp.name;
            this.doneSteps = JSON.parse(exp.setup_steps);

        };
        if(root.params.experiment) {
            finish(root.params.experiment)
        }
        else {
            root.dataService.getExperimentForOwner(root.params.id).then(finish);
        }
    }

    togglecheck = () => {
        this.experiment.lock_responses = this.eLockResponses.checked;
        this.experiment.show_results = this.eShowresults.checked;
    };

    root;
    experiment: Experiment;
    newQuestion:string = "";
    newPreQuestion:string = "";
    newSubject:string = "";
    step = 0;
    doneSteps = 0;
    nameString:string = "";
    moniker:string;

    eLockResponses;
    eShowresults;

    checkName = () => {
        if(!this.moniker || !this.nameString) return Promise.reject("Moniker or Name is blank.");

        let plural, singular;
        if(pluralize.isPlural(this.moniker)){
            plural = this.moniker;
            singular = pluralize.singular(this.moniker);
        } else {
            singular = this.moniker;
            plural = pluralize.plural(this.moniker);
        }

        let data = {
            id: this.experiment.id,
            name: this.nameString,
            moniker:singular,
            plural:plural
        };

        return this.root.dataService.save({
            type: Model.experiment,
            data: data
        }).then((data)=>{
            Object.assign(this.experiment, data);
            return 1;
        });
    };

    checkSetup = () => {
        return this.root.dataService.save({
            type: Model.experiment,
            data: {
                id: this.experiment.id,
                description:this.experiment.description,
                conclusion:this.experiment.conclusion,
                lock_responses: this.experiment.lock_responses,
            }
        }).then((data)=>{
            Object.assign(this.experiment, data);
            return 1;
        });
    };

    checkPrequestions = () => {

        // Must be at least one question to ask participants
        if(this.experiment.preQuestions.length == 0){
            return Promise.resolve(0);
        }

        return this.saveQuestions(true).then(()=>{ return 1});
    };

    checkQuestions = () => {

        // Must be at least one question to ask participants
        if(this.experiment.questions.length == 0){
            return Promise.resolve(0)
        }

        return this.saveQuestions(false).then(()=>{ return 1});
    };

    checkSubjects = () => {

        if (this.experiment.subjects.length === 0) {
            alert("Must have at least one "+ this.experiment.moniker + ".");
            return 0;
        }

        return this.saveMap1().then(()=>{
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
/**/
    steps = [
        {
            name: "Name",
            disabled: true,
            stateName: 'build.name',
            saveStep: this.checkName
        },
        {
            name: "Options",
            disabled: true,
            stateName: 'build.options',
            saveStep: this.checkSetup
        },
        {
            name: "Initial Questions",
            disabled: false,
            stateName: 'build.prequestions',
            saveStep: this.checkPrequestions
        },
        {
            name: "Drink Questions",
            disabled: false,
            stateName: 'build.questions',
            saveStep: this.checkQuestions
        },
        {
            name: "Drinks",
            disabled: true,
            stateName: 'build.subjects',
            saveStep: this.checkSubjects
        }
    ];


    gotoNextStep = () => {
        this.steps[this.step].saveStep().then((next)=>{
            if(this.step == 5){
                return this.startTrial();
            }
            this.gotoStep(this.step + next);
        }, (reason)=>{
            console.log("Can't proceed: " + reason)
        });
    };

    gotoStep = (step: number)=> {
        console.log("Going to: " + this.steps[step].name);
        this.step = step;
        this.root.state.go(this.steps[step].stateName);
    };


    addSubject = ()=>{
        resetValidations(['subject']);
        if(this.experiment.subjects.some((e)=>{return e.text === this.newSubject})){
            return invalid('subject', 'That subject already exists.')
        }
        if(this.newSubject.length > 0) {
            this.experiment.subjects.push({
                id: -1,
                text: this.newSubject,
                alias: ''
            });
            this.newSubject = "";
            document.getElementById("newSubject").focus();
        }
    };

    deleteSubject = (subject, idx) => {
        this.root.log("delete " +
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
                        alias: s.alias
                    }
                }
            }
            return {
                type: Model.subject,
                data:{
                    experiment_id: this.experiment.id,
                    name: s.text,
                    alias: s.alias
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
        this.root.log("delete " + idx);
        if(confirm("Delete question?")) {
            this.root.dataService.delete({type: Model.question, id:question.id}).then(()=>{
                if(question.per_subject)
                    this.experiment.questions.splice(idx, 1);
                else
                    this.experiment.preQuestions.splice(idx, 1);
            })
        }
    };

    saveQuestions = (pre:boolean)=> {
        let array = pre? this.experiment.preQuestions : this.experiment.questions;
        return this.root.dataService.save(array.map((s)=>{
            let data = {
                text: s.text,
                per_subject: s.perSubject,
                required: s.required
            };

            if(s.id == -1){
                data['experiment_id'] = this.experiment.id;
            } else {
                data[' id'] = s.id;
            }
            return {
                type: Model.question,
                data: data
            }
        }))
    };

}