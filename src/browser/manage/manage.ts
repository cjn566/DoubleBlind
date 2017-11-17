
import 'angular-ui-router';
import * as angular from 'angular';
import DataService from '../services/DataService';
import httpInterceptor from '../services/HttpInterceptor';

import SelectController from "../manage/controllers/SelectController";
import MapTwoController from "../manage/controllers/MapTwoController";
import ManageController from "../manage/controllers/BuildController";
import SubjectsController from "../manage/controllers/Subjects";
import LiveController from "../manage/controllers/LiveController";
import ConcludedController from "../manage/controllers/ConcludedController";
import Base from "../manage/controllers/base";



(function(){

    angular.module("DoubleBlind", ["ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .factory('httpInterceptor', ['$q', '$rootScope', '$location', '$state', httpInterceptor])
        .controller('base', ["$log", "dataService", '$state', '$templateCache', Base])
        .controller('manageController', ["$log", "dataService", "$state", "$stateParams", ManageController])
        .controller('subjectsController', ["$log", "dataService", "$state", "$stateParams", SubjectsController])
        .controller('selectController', ["$log", "dataService", "$state", "studies", '$templateCache', SelectController])
        .controller('mapTwoController', ["$log", "dataService", "$state", "$stateParams", MapTwoController])
        .controller('liveController', ["$log", "dataService", "$state", "$stateParams", LiveController])
        .controller('concludedController', ["$log", "dataService", "$state", "$stateParams", ConcludedController])
        .config(
            ['$stateProvider', '$logProvider', '$urlRouterProvider', '$httpProvider', '$compileProvider', '$locationProvider',
            function( $stateProvider, $logProvider, $urlRouterProvider, $httpProvider, $compileProvider, $lp){
                $lp.html5Mode(true);
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
                .state("build.setup",{
                    url:"",
                    controller: "manageController",
                    controllerAs: "ctrl",
                    templateUrl:"buildstudy.html"
                })
                .state("build.subjects",{
                    url:"",
                    controller: "subjectsController",
                    controllerAs: "ctrl",
                    templateUrl:"add_subjects.html"
                })
                .state("build.map",{
                    url:"",
                    controller: "mapTwoController",
                    controllerAs: "ctrl",
                    templateUrl:"secondmap.html"
                })
                .state("live",{
                    url:"/live/:id",
                    controller: "liveController",
                    controllerAs: "ctrl",
                    templateUrl:"live.html",
                    params: {
                        experiment: null,
                        id: null
                    }
                })
                .state("results",{
                    url:"/results/:id",
                    controller: "concludedController",
                    controllerAs: "ctrl",
                    templateUrl:"concluded.html",
                    params: {
                        experiment: null,
                        id: null
                    }
                });
            $httpProvider.interceptors.push('httpInterceptor');
            $compileProvider.debugInfoEnabled(true);
        }])
        .run(['$rootScope', '$state', function($rootScope, state) {
            $rootScope.$on("$stateChangeError", console.log.bind(console));
        }]);
}());

