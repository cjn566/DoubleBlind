
import 'angular-ui-router';
import * as angular from 'angular';
import DataService from '../services/DataService';
import SelectStudyController from './controllers/selectStudy';
import SelectSubjectController from './controllers/selectSubject';
import AnswerQuestionsController from './controllers/answerQuestions';
import SetName from './controllers/setName';


(function(){

    angular.module("DoubleBlind", ["ui.router"])
        .factory("dataService", ["$http", "$log", DataService])
        .controller('selectStudyController', ["$log", "dataService", "$state", "studies", SelectStudyController])
        .controller('setName', ["$state", "dataService", "$stateParams", SetName])
        .controller('selectSubjectController', ["$log", "dataService", "$state", "$stateParams", SelectSubjectController])
        .controller('answerQuestionsController', ["$log", "dataService", "$state", "$stateParams", AnswerQuestionsController])
        .config(['$stateProvider', '$logProvider', function( $stateProvider, $logProvider){
            $logProvider.debugEnabled(true);

            $stateProvider
                .state("selectStudy",{
                    url:"/",
                    controller: "selectStudyController",
                    controllerAs: "ctrl",
                    templateUrl:"participate/select-study.html",
                    resolve: {
                        studies: function(dataService){
                            return dataService.getStudies()
                        }
                    }
                })
                .state("setName",{
                    url:"/setName/study=:id",
                    controller: "setName",
                    controllerAs: "ctrl",
                    templateUrl:"participate/set-name.html",
                    params: {
                        id: null
                    }
                })
                .state("selectSubject",{
                    url:"/study=:id",
                    controller: "selectSubjectController",
                    controllerAs: "ctrl",
                    templateUrl:"participate/select-subject.html",
                    params: {
                        study: null,
                        id: null
                    }
                })
                .state("answerQuestions",{
                    url:"/study=:id/subject=:subId",
                    controller: "answerQuestionsController",
                    controllerAs: "ctrl",
                    templateUrl:"participate/answer-questions.html",
                    params: {
                        id: null,
                        subId: null
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

