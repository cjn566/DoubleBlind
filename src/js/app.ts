
import 'angular-ui-router';
import * as angular from 'angular';
import DataService from './services/DataService';
import httpInterceptor from './services/HttpInterceptor';

import Base from './controllers/base';
import SelectSubject from './controllers/join/selectSubject';
import AnswerQuestions from './controllers/join/answerQuestions';
import SetName from './controllers/setName';
import SelectController from "./controllers/SelectController";
import MapOneController from "./controllers/MapOneController";
import MapTwoController from "./controllers/MapTwoController";
import ManageController from "./controllers/BuildController";
import LiveController from "./controllers/LiveController";
import ConcludedController from "./controllers/ConcludedController";
import JoinBase from "./controllers/join/base";



(function(){

    angular.module("DoubleBlind", ["ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .factory('httpInterceptor', ['$q', '$rootScope', '$location', httpInterceptor])
        .controller('base', ["$log", "dataService", Base])
        .controller('setName', ["$state", "dataService", "$stateParams", SetName])
        .controller('selectSubject', ["$log", "dataService", "$state", "$stateParams",'subjectList', SelectSubject])
        .controller('answerQuestions', ["$log", "dataService", "$state", "$stateParams", 'subject','questionList', AnswerQuestions])
        .controller('manageController', ["$log", "dataService", "$state", "$stateParams", ManageController])
        .controller('selectController', ["$log", "dataService", "$state", "studies", SelectController])
        .controller('mapOneController', ["$log", "dataService", "$state", "$stateParams", MapOneController])
        .controller('mapTwoController', ["$log", "dataService", "$state", "$stateParams", MapTwoController])
        .controller('liveController', ["$log", "dataService", "$state", "$stateParams", LiveController])
        .controller('concludedController', ["$log", "dataService", "$state", "$stateParams", ConcludedController])
        .controller('JoinBase', ["$log", "dataService", "$state", "$stateParams", 'study', JoinBase])
        .config(['$stateProvider', '$logProvider', '$urlRouterProvider', '$httpProvider', '$compileProvider',
            function( $stateProvider, $logProvider, $urlRouterProvider, $httpProvider, $compileProvider){
            $logProvider.debugEnabled(true);

            $stateProvider

                // JOIN Study States
                .state("join",{
                    url:"/join/:id",
                    abstract:"true",
                    controller: "JoinBase",
                    controllerAs: "joinShellCtrl",
                    templateUrl:"join/join-shell.html",
                    params: {
                        id: null
                    },
                    resolve:{
                        study: ["dataService", '$stateParams', function(dataService, $stateParams){
                            return dataService.getStudy($stateParams.id);
                        }]
                    }
                })
                .state("join.select",{
                    url:"/subjects",
                    controller: "selectSubject",
                    controllerAs: "joinCtrl",
                    templateUrl:"join/select-subject.html",
                    resolve:{
                        subjectList: ["study", (s)=>{return s.subjects}]
                    }

                })
                .state("join.answer",{
                    url:"/subject=:subId",
                    controller: "answerQuestions",
                    controllerAs: "joinCtrl",
                    templateUrl:"join/answer-questions.html",
                    params: {
                        subId: null,
                        subject: null
                    },
                    resolve: {
                        subject: ["study", '$stateParams', (s, p)=>{
                            let sub = s.subjects[s.subjects.findIndex( e => e.id == p.subId)];
                            return sub;
                        }],
                        questionList: ["study", (s)=>{return s.questions}]
                    }
                })

                // Build states
                .state("home",{
                    url:"/",
                    controller: "selectController",
                    controllerAs: "ctrl",
                    templateUrl:"home.html",
                    resolve: {
                        studies: function(dataService){
                            return dataService.getStudies()
                        }
                    }
                })
                .state("selectStudy",{
                    url:"/selectStudy",
                    controller: "selectStudyController",
                    controllerAs: "ctrl",
                    templateUrl:"select-study-part.html",
                    resolve: {
                        studies: function(dataService){
                            return dataService.getStudies()
                        }
                    }
                })
                .state("build",{
                    url:"/build/:id",
                    controller: "manageController",
                    controllerAs: "ctrl",
                    templateUrl:"buildstudy.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("map1",{
                    url:"/build/:id",
                    controller: "mapOneController",
                    controllerAs: "ctrl",
                    templateUrl:"firstmap.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("map2",{
                    url:"/build/:id",
                    controller: "mapTwoController",
                    controllerAs: "ctrl",
                    templateUrl:"secondmap.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("live",{
                    url:"/build/:id",
                    controller: "liveController",
                    controllerAs: "ctrl",
                    templateUrl:"live.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("concluded",{
                    url:"/build/:id",
                    controller: "concludedController",
                    controllerAs: "ctrl",
                    templateUrl:"concluded.html",
                    params: {
                        study: null,
                        id: null
                    }
                });
            $httpProvider.interceptors.push('httpInterceptor');
            $compileProvider.debugInfoEnabled(true);
        }])
}());

