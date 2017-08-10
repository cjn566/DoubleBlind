
import 'angular-ui-router';
import * as angular from 'angular';
import DataService from './services/DataService';
import SelectController from './controllers/SelectController';
import ManageController from "./controllers/BuildController";
import MapTwoController from "./controllers/MapTwoController";
import MapOneController from "./controllers/MapOneController";
import LiveController from "./controllers/LiveController";
import ConcludedController from "./controllers/ConcludedController";

(function(){

    angular.module("DoubleBlindManager", ["ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .controller('selectController', ["$log", "dataService", "$state", "studies", SelectController])
        .controller('manageController', ["$log", "dataService", "$state", "$stateParams", ManageController])
        .controller('mapOneController', ["$log", "dataService", "$state", "$stateParams", MapOneController])
        .controller('mapTwoController', ["$log", "dataService", "$state", "$stateParams", MapTwoController])
        .controller('liveController', ["$log", "dataService", "$state", "$stateParams", LiveController])
        .controller('concludedController', ["$log", "dataService", "$state", "$stateParams", ConcludedController])
        .config(['$stateProvider', '$logProvider', function( $stateProvider, $logProvider){
            $logProvider.debugEnabled(true);

            $stateProvider
                .state("",{
                    url:"/manage",
                    controller: "selectController",
                    controllerAs: "ctrl",
                    templateUrl:"manage/select-study.html",
                    resolve: {
                        studies: function(dataService){
                            return dataService.getStudies()
                        }
                    }
                })
                .state("build",{
                    url:"/:id",
                    controller: "manageController",
                    controllerAs: "ctrl",
                    templateUrl:"buildstudy.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("map1",{
                    url:"/:id",
                    controller: "mapOneController",
                    controllerAs: "ctrl",
                    templateUrl:"firstmap.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("map2",{
                    url:"/:id",
                    controller: "mapTwoController",
                    controllerAs: "ctrl",
                    templateUrl:"secondmap.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("live",{
                    url:"/:id",
                    controller: "liveController",
                    controllerAs: "ctrl",
                    templateUrl:"live.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("concluded",{
                    url:"/:id",
                    controller: "concludedController",
                    controllerAs: "ctrl",
                    templateUrl:"concluded.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
        }])
        .run($trace => $trace.enable('TRANSISTION'))
        .run(($rootScope, $log)=>{
            $rootScope.$on('$stateChangeError', ()=>{
                $log.error("HIT MF")
            })
        });


}());