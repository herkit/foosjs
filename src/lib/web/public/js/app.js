'use strict';

angular.module('foosjsApp', ['ngMaterial'])

.controller('FoosJsController', function FoosJsController($scope, $mdDialog, $http) {
  $scope.newEvent = function(ev) {
    console.log("open dialog");
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'js/dialogs/new-event/new-event.template.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clicOutsideToClose:true,
      fullscreen:true
    }).then(function(foosevent) {
      console.log("Saving event", foosevent);
      $http
        .post("/events", foosevent)
        .then(
          function(response) { console.log(response); },
          function(reason) {
            $mdDialog.show(
              $mdDialog.alert()
              .parent(angular.element(document.body))
              .clickOutsideToClose(true)
              .title('Storing event failed')
              .textContent(reason.data.message)
              .ok("Ok")
              .targetEvent(ev));
          }
        );
    })
  }

  function DialogController($scope, $mdDialog) {
    var ctrl = this;
    ctrl.event = {};

    $scope.update = function(foosevent) {
      ctrl.event = foosevent;
    }

    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.save = function() {
      $mdDialog.hide(ctrl.event);
    }
  }  
});