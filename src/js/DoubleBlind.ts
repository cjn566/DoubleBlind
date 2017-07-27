
import * as angular from 'angular';
import DataService from './services/DataService';
import SelectController from './controllers/selectController';
import ManageController from "./controllers/ManageController";
import MapController from "./controllers/mapController";
import 'angular-xeditable';
import 'angular-ui-router';

(function(){

    angular.module("DoubleBlind", ["xeditable", "ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .controller('selectController', ["$log", "dataService", "$state", "studies", SelectController])
        .controller('manageController', ["$log", "dataService", "$state", "$stateParams", ManageController])
        .controller('mapController', ["$log", "dataService", "$state", "$stateParams", MapController])
        .config(['$stateProvider', '$logProvider', function( $stateProvider, $logProvider){
            $logProvider.debugEnabled(true);

            $stateProvider
                .state("select",{
                    url:"",
                    controller: "selectController",
                    controllerAs: "ctrl",
                    templateUrl:"selectstudy.html",
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
                    params: {id: null},
                    /*
                    resolve:
                        study: (stateParams)=>{
                        console.log("Hit1")
                        console.log(stateParams)
                    }
                    */
                })
                .state("map1",{
                    url:"/map1/:name",
                    controller: "mapController",
                    controllerAs: "ctrl",
                    templateUrl:"firstmap.html",
                    params: {study: null}
                })
        }])
        .run($trace => $trace.enable('TRANSISTION'))
        .run(($rootScope, $log)=>{
            $rootScope.$on('$stateChangeError', ()=>{
                $log.error("HIT MF")
            })
        })
}());