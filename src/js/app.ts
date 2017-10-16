
import 'angular-ui-router';
import * as angular from 'angular';
import DataService from './services/DataService';
import httpInterceptor from './services/HttpInterceptor';

import Base from './controllers/base';
import SelectStudyController from './controllers/selectStudy';
import SelectSubjectController from './controllers/selectSubject';
import AnswerQuestionsController from './controllers/answerQuestions';
import SetName from './controllers/setName';
import SelectController from "./controllers/SelectController";
import MapOneController from "./controllers/MapOneController";
import MapTwoController from "./controllers/MapTwoController";
import ManageController from "./controllers/BuildController";
import LiveController from "./controllers/LiveController";
import ConcludedController from "./controllers/ConcludedController";



(function(){

    angular.module("DoubleBlind", ["ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .factory('httpInterceptor', ['$q', '$rootScope', '$location', httpInterceptor])
        .controller('base', ["$log", "dataService", Base])
        .controller('selectStudyController', ["$log", "dataService", "$state", "studies", SelectStudyController])
        .controller('setName', ["$state", "dataService", "$stateParams", SetName])
        .controller('selectSubject', ["$log", "dataService", "$state", "$stateParams", SelectSubjectController])
        .controller('answerQuestionsController', ["$log", "dataService", "$state", "$stateParams", AnswerQuestionsController])
        .controller('manageController', ["$log", "dataService", "$state", "$stateParams", ManageController])
        .controller('selectController', ["$log", "dataService", "$state", "studies", SelectController])
        .controller('mapOneController', ["$log", "dataService", "$state", "$stateParams", MapOneController])
        .controller('mapTwoController', ["$log", "dataService", "$state", "$stateParams", MapTwoController])
        .controller('liveController', ["$log", "dataService", "$state", "$stateParams", LiveController])
        .controller('concludedController', ["$log", "dataService", "$state", "$stateParams", ConcludedController])
        .config(['$stateProvider', '$logProvider', '$urlRouterProvider', '$httpProvider',
            function( $stateProvider, $logProvider, $urlRouterProvider, $httpProvider){
            $logProvider.debugEnabled(true);

            $stateProvider
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
                .state("participate",{
                    url:"/participate/study=:id",
                    controller: "selectSubject",
                    controllerAs: "ctrl",
                    templateUrl:"select-subject.html",
                    params: {
                        id: null
                    }
                })
                .state("selectSubject",{
                    url:"/study=:id",
                    controller: "selectSubjectController",
                    controllerAs: "ctrl",
                    templateUrl:"select-subject.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("answerQuestions",{
                    url:"/study=:id/subject=:subId",
                    controller: "answerQuestionsController",
                    controllerAs: "ctrl",
                    templateUrl:"answer-questions.html",
                    params: {
                        id: null,
                        subId: null
                    }
                })
                .state("select",{
                    url:"/html",
                    controller: "selectController",
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
        }])
}());

