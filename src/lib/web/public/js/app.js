'use strict';

angular.module('foosjsApp', ['ngMaterial'])

.controller('FoosJsController', function FoosJsController($scope, $mdDialog) {
  $scope.newEvent = function(ev) {
    console.log("open dialog");
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'js/dialogs/new-event/new-event.template.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clicOutsideToClose:true,
      fullscreen:true
    })
  }

  function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }  
});