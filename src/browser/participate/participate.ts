
import 'angular-ui-router';
import * as angular from 'angular';
import DataService from './services/DataService';
import httpInterceptor from '../manage/services/HttpInterceptor';

import Join from "./controllers/join";

document.addEventListener('load', function() {
    let scale = 1 / (window.devicePixelRatio || 1);
    let content = 'width=device-width, initial-scale=' + scale;
    document.querySelector('meta[name="viewport"]').setAttribute('content', content)
}, false);

(function(){

    angular.module("DoubleBlind", ["ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .factory('httpInterceptor', ['$q', '$rootScope', '$location', '$state', httpInterceptor])
        .controller('Join', ["$log", "dataService", "$state", "$stateParams", 'experiment', 'answers', '$scope', Join])
        .config(
            ['$stateProvider', '$logProvider', '$urlRouterProvider', '$httpProvider', '$compileProvider', '$locationProvider',
            function( $stateProvider, $logProvider, $urlRouterProvider, $httpProvider, $compileProvider, $lp){
            $lp.html5Mode(true);
            $logProvider.debugEnabled(true);


            $stateProvider

                // JOIN Experiment States
                .state("join",{
                    url:"/:link",
                    abstract:"true",
                    controller: "Join",
                    controllerAs: "ctrl",
                    templateUrl:"join-shell.html",
                    params: {
                        link: null
                    },
                    resolve:{
                        experiment: ["dataService", '$stateParams', function(dataService, $stateParams){
                            return dataService.getExperimentForParticipant($stateParams.link).then((experiment)=>{
                                return experiment;
                            });
                        }],
                        answers: ["dataService", "$stateParams", function(dataService, params){
                            return dataService.getAnswers(params.link).then((answers)=>{
                                return answers;
                            })
                        }]
                    }
                })
                .state("join.prelim",{
                    url:"/prelim",
                    templateUrl:"prelim-questions.html"
                })
                .state("join.select",{
                    url:"",
                    templateUrl:"select-subject.html"
                })
                .state("join.answer",{
                    url:"/:subId",
                    templateUrl:"answer-questions.html",
                    params: {
                        subId: null
                    }
                })
                .state("not-live",{
                    template:"<p>The experiment you are trying to join is not yet ready.</p>"
                })
                .state("is-concluded",{
                    template:"<p>The experiment you are trying to join has already concluded.</p>"
                })

            $httpProvider.interceptors.push('httpInterceptor');
            $compileProvider.debugInfoEnabled(true);
        }])
        .run(['$rootScope', '$state', function($rootScope, $document) {
            $rootScope.$on('$stateChangeSuccess', function() {
                $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
            });
        }]);
}());

