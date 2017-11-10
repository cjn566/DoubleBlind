
import 'angular-ui-router';
import * as angular from 'angular';
import DataService from './services/DataService';
import httpInterceptor from './services/HttpInterceptor';

import SelectController from "./controllers/SelectController";
import MapTwoController from "./controllers/MapTwoController";
import ManageController from "./controllers/BuildController";
import SubjectsController from "./controllers/Subjects";
import LiveController from "./controllers/LiveController";
import ConcludedController from "./controllers/ConcludedController";
import Join from "./controllers/join/join";
import Base from "./controllers/base";



(function(){

    angular.module("DoubleBlind", ["ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .factory('httpInterceptor', ['$q', '$rootScope', '$location', '$state', httpInterceptor])
        .controller('base', ["$log", "dataService", '$state', Base])
        .controller('manageController', ["$log", "dataService", "$state", "$stateParams", ManageController])
        .controller('subjectsController', ["$log", "dataService", "$state", "$stateParams", SubjectsController])
        .controller('selectController', ["$log", "dataService", "$state", "studies", '$templateCache', SelectController])
        .controller('mapTwoController', ["$log", "dataService", "$state", "$stateParams", MapTwoController])
        .controller('liveController', ["$log", "dataService", "$state", "$stateParams", LiveController])
        .controller('concludedController', ["$log", "dataService", "$state", "$stateParams", ConcludedController])
        .controller('Join', ["$log", "dataService", "$state", "$stateParams", 'study', '$scope', Join])
        .config(
            ['$stateProvider', '$logProvider', '$urlRouterProvider', '$httpProvider', '$compileProvider',
            function( $stateProvider, $logProvider, $urlRouterProvider, $httpProvider, $compileProvider){
            $logProvider.debugEnabled(true);

            $stateProvider

                // JOIN Study States
                .state("join",{
                    url:"/join=:link",
                    abstract:"true",
                    controller: "Join",
                    controllerAs: "ctrl",
                    templateUrl:"join-shell.html",
                    params: {
                        link: null
                    },
                    resolve:{
                        study: ["dataService", '$stateParams', function(dataService, $stateParams){
                            return dataService.getStudyForParticipant($stateParams.link).then((study)=>{
                                return study;
                            });
                        }]
                    }
                })
                .state("join.select",{
                    url:"/join=:link",
                    controller: "Join",
                    controllerAs: "ctrl",
                    templateUrl:"select-subject.html"
                })
                .state("join.answer",{
                    url:"/subject=:subId",
                    controller: "Join",
                    controllerAs: "ctrl",
                    templateUrl:"answer-questions.html",
                    params: {
                        subId: null
                    }
                })
                /*
                .state("join.prequestions",{
                    url:"/join=:link",
                    controller: "Join",
                    controllerAs: "ctrl",
                    templateUrl:"prequestions.html"
                })
                .state("not-live",{
                    template:"<p>The study you are trying to join is not yet ready.</p>"
                })
                .state("is-concluded",{
                    template:"<p>The study you are trying to join has already concluded.</p>"
                })
                */

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
                .state("subjects",{
                    url:"/subjects/:id",
                    controller: "subjectsController",
                    controllerAs: "ctrl",
                    templateUrl:"add_subjects.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("map",{
                    url:"/map/:id",
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
        .run(['$state', '$templateCache', function( state, cache){
        }])
}());

