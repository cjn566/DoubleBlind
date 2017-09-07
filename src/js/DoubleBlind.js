let angular = require('angular');
(function () {
    let ManageController = require('./controllers/ManageController');
    let ManageService = require('./services/ManageService');
    require('angular-xeditable');
    require('angular-ui-router');
    angular.module("DoubleBlind", ["xeditable", "ui.router"])
        .factory("manageService", ["$http", "$log", ManageService])
        .controller('manageController', ["$log", "manageService", ManageController])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state("select", {
                url: "/manage",
                controller: "MainController",
                controllerAs: "ctrl",
                templateUrl: "selectstudy.html"
            });
        }])
        .run((editableOptions) => {
        editableOptions.theme = 'bs3';
    });
}());
//# sourceMappingURL=DoubleBlind.js.map