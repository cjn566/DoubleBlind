

import {Model, Experiment, Stage} from "../../../common/interfaces/experiment";
import {invalid, resetValidations, shuffle} from "../../Misc";
import subject from './Subjects'
import * as pluralize from 'pluralize';

declare let $: any;

export default class {

    states = {
        'build.name': 0,
        'build.options': 1,
        'build.prequestions': 2,
        'build.questions': 3,
        'build.subjects': 4,
        'build.map': 5
    };

    constructor(root, transitions){

        this.root = root;

        let that = this;
        transitions.onSuccess({ to: 'build.**' }, function(transition) {
            that.step = that.states[transition.to().name];
            that.navBar(that.step);
        });

        let finish = (exp) => {
            this.experiment = exp;
            this.eLockResponses = $('#lock-check');
            this.eLockResponses.prop( "checked", this.experiment.lock_responses);
            this.aliasString = "" + exp.aliases;
            this.nameString = exp.name;

            if(exp.name){
                if(exp.conclusion){
                    if(exp.preQuestions.length){
                        if(exp.questions.length){
                            if(exp.subjects.length && (exp.aliases == 2)){
                                this.step = 5;
                            } else {
                                this.step = 4;
                            }
                        }  else {
                            this.step = 3;
                        }
                    } else {
                        this.step = 2;
                    }
                } else {
                    this.step = 1;
                }
            } else {
                this.step = 0;
            }

            this.gotoStep();
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
    };

    root;
    experiment: Experiment;
    newQuestion:string = "";
    newPreQuestion:string = "";
    newSubject:string = "";
    step = 0;
    nameString:string = "";
    moniker:string;

    eLockResponses;
    aliasString:string;

    navBar = (step: number) => {
        let eSteps = $('#build-steps > li');
        eSteps.removeClass('active').addClass((i)=>{
            return (i == step)? 'active' : '';
        });
    }

    checkName = () => {
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
        this.experiment.aliases = parseInt(this.aliasString);


        return this.root.dataService.save({
            type: Model.experiment,
            data: {
                id: this.experiment.id,
                description:this.experiment.description,
                conclusion:this.experiment.conclusion,
                lock_responses: this.experiment.lock_responses,
                aliases: this.experiment.aliases
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
/**/
    steps = [
        {
            name: "Name",
            stateName: 'build.names',
            nextFunction: this.checkName
        },
        {
            name: "Options",
            stateName: 'build.options',
            nextFunction: this.checkSetup
        },
        {
            name: "Initial Questions",
            stateName: 'build.prequestions',
            nextFunction: this.checkPrequestions
        },
        {
            name: "Drink Questions",
            stateName: 'build.questions',
            nextFunction: this.checkQuestions
        },
        {
            name: "Drinks",
            stateName: 'build.subjects',
            nextFunction: this.checkSubjects
        },
        {
            name: "Re-Map",
            stateName: 'build.map',
            nextFunction: this.checkMap
        }
    ];


    gotoNextStep = () => {
        this.steps[this.step].nextFunction().then((next)=>{
            if (next){
                this.step += next;
                if(this.step == 6){
                    return this.startTrial();
                }
                this.gotoStep();
            }
        });
    };

    gotoStep = ()=> {
        this.navBar(this.step);
        console.log("Going to: " + this.steps[this.step].name);
        this.root.state.go(this.steps[this.step].stateName);
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
                displayname: '',
                map1: '',
                map2: ''
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

    updateMapFromUI = (subject, form)=>{
        if(form.$dirty) {
            this.root.log("saving mapping");
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
        }).catch(this.root.err)
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