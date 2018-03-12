
import 'angular-ui-router';
import * as angular from 'angular';
import DataService from './services/DataService';
import httpInterceptor from './services/HttpInterceptor';

import SelectController from "../manage/controllers/SelectController";
import ManageController from "../manage/controllers/BuildController";
import LiveController from "../manage/controllers/LiveController";
import ConcludedController from "../manage/controllers/ConcludedController";
import Base from "../manage/controllers/base";



(function(){

    angular.module("DoubleBlind", ["ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .factory('httpInterceptor', ['$q', '$rootScope', '$location', '$state', httpInterceptor])
        .controller('base', ['$rootScope', Base])
        .controller('selectController', ['$rootScope', "studies", SelectController])
        .controller('manageController', ['$rootScope','$transitions', ManageController])
        .controller('liveController', ['$rootScope', "experiment", LiveController])
        .controller('concludedController', ["$log", "dataService", "$state", "$stateParams", ConcludedController])
        .config(
            ['$stateProvider', '$logProvider', '$urlRouterProvider', '$httpProvider', '$compileProvider', '$locationProvider',
            function( $stateProvider, $logProvider, $urlRouterProvider, $httpProvider, $compileProvider, $lp){
                $lp.html5Mode(true);
            $logProvider.debugEnabled(true);

            $stateProvider
                .state("home",{
                    url:"/manage.html",
                    controller: "selectController",
                    controllerAs: "ctrl",
                    templateUrl:"simple_home.html",
                    resolve: {
                        studies: function(dataService){
                            return dataService.getExperiments()
                        }
                    }
                })
                .state("build",{
                    url:"/build/:id",
                    abstract:true,
                    controller: "manageController",
                    controllerAs: "ctrl",
                    templateUrl:"build-shell.html",
                    params: {
                        experiment: null,
                        id: null
                    }
                })
                .state("build.name",{
                    url:"",
                    templateUrl:"/build/1-name.html"
                })
                .state("build.options",{
                    url:"",
                    templateUrl:"/build/2-options.html"
                })
                .state("build.prequestions",{
                    url:"",
                    templateUrl:"/build/3-prequestions.html"
                })
                .state("build.questions",{
                    url:"",
                    templateUrl:"/build/4-questions.html"
                })
                .state("build.subjects",{
                    url:"",
                    templateUrl:"/build/5-subjects.html"
                })
                .state("live",{
                    url:"/live/:id",
                    controller: "liveController",
                    controllerAs: "ctrl",
                    templateUrl:"live.html",
                    resolve: {
                        experiment: function(dataService, $stateParams){
                            return dataService.getExperimentForOwner($stateParams.id)
                        }
                    }
                })
                .state("results",{
                    url:"/results/:id",
                    controller: "concludedController",
                    controllerAs: "ctrl",
                    templateUrl:"concluded.html",
                    resolve: {
                        experiment: function(dataService){
                            return dataService.getExperimentForOwner()
                        }
                    }
                });
            $httpProvider.interceptors.push('httpInterceptor');
            $compileProvider.debugInfoEnabled(true);
        }])
        .run(['$rootScope', '$state', '$log', "dataService", "$stateParams",'$transitions', function($rootScope, state, log, ds, sp, $transitions) {
            $rootScope.state = state;
            $rootScope.log = (m) => log.log(m);
            $rootScope.err = (m) => log.error(m);
            $rootScope.dataService = ds;
            $rootScope.params = sp;
        }]);
}());

