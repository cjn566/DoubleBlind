
let angular = require('angular');
let ngRoute = require('angular-route');

(function(){
    let ManageController = require('./controllers/ManageController');
    let ManageService = require('./services/ManageService');
    let xeditable = require('angular-xeditable');

    angular.module("DoubleBlind", ["xeditable"])
        .factory("manageService", ["$http", "$log", ManageService])
        .controller('manageController', ["$log", "manageService", ManageController])
        .config(function( ){

        })
        .run((editableOptions)=>{
            editableOptions.theme = 'bs3';
        });

}());