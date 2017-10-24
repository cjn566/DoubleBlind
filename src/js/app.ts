
import 'angular-ui-router';
import * as angular from 'angular';
import DataService from './services/DataService';
import httpInterceptor from './services/HttpInterceptor';

import SelectController from "./controllers/SelectController";
import MapOneController from "./controllers/MapOneController";
import MapTwoController from "./controllers/MapTwoController";
import ManageController from "./controllers/BuildController";
import LiveController from "./controllers/LiveController";
import ConcludedController from "./controllers/ConcludedController";
import Join from "./controllers/join/join";
import Base from "./controllers/base";



(function(){

    angular.module("DoubleBlind", ["ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .factory('httpInterceptor', ['$q', '$rootScope', '$location', httpInterceptor])
        .controller('base', ["$log", "dataService", Base])
        .controller('manageController', ["$log", "dataService", "$state", "$stateParams", ManageController])
        .controller('selectController', ["$log", "dataService", "$state", "studies", SelectController])
        .controller('mapOneController', ["$log", "dataService", "$state", "$stateParams", MapOneController])
        .controller('mapTwoController', ["$log", "dataService", "$state", "$stateParams", MapTwoController])
        .controller('liveController', ["$log", "dataService", "$state", "$stateParams", LiveController])
        .controller('concludedController', ["$log", "dataService", "$state", "$stateParams", ConcludedController])
        .controller('Join', ["$log", "dataService", "$state", "$stateParams", 'study', '$scope', Join])
        .config(['$stateProvider', '$logProvider', '$urlRouterProvider', '$httpProvider', '$compileProvider',
            function( $stateProvider, $logProvider, $urlRouterProvider, $httpProvider, $compileProvider){
            $logProvider.debugEnabled(true);

            $stateProvider

                // JOIN Study States
                .state("join",{
                    url:"/join=:link",
                    abstract:"true",
                    controller: "Join",
                    controllerAs: "ctrl",
                    templateUrl:"join/join-shell.html",
                    params: {
                        link: null
                    },
                    resolve:{
                        study: ["dataService", '$stateParams', function(dataService, $stateParams){
                            return dataService.getStudyByLink($stateParams.id).then((study)=>{
                                return dataService.answers(study.id).then((answers)=>{
                                    study['answers'] = answers;
                                    return study;
                                });
                            });
                        }]
                    }
                })
                .state("join.select",{
                    url:"",///subjects",
                    controller: "Join",
                    controllerAs: "ctrl",
                    templateUrl:"join/select-subject.html"
                })
                .state("join.answer",{
                    url:"/subject=:subId",
                    controller: "Join",
                    controllerAs: "ctrl",
                    templateUrl:"join/answer-questions.html",
                    params: {
                        subId: null
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

