'use strict';

angular.module('foosjsApp', ['ngMaterial', 'angularMoment'])

.controller('FoosJsController', function FoosJsController($scope, $mdDialog, $http, foosPlayers) {
  $scope.newEvent = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'js/dialogs/new-event/new-event.template.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clicOutsideToClose:false,
      fullscreen:true
    }).then(function(foosevent) {
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

  $scope.selectedPlayerIds = [];

  $scope.selectedPlayersChanged = function(playerIds) {
    $scope.selectedPlayerIds = playerIds;
  }

  $scope.showComparison = function(ev) {
    $mdDialog.show({
      controller: PlayerComparisonController,
      templateUrl: 'js/dialogs/player-comparison/player-comparison.template.html',
      parent: angular.element(document.body),
      locals: {
        players: $scope.selectedPlayerIds
      },
      targetEvent: ev,
      clicOutsideToClose:true,
      fullscreen:true
    });
  }

  $scope.newPlayer = foosPlayers.newPlayer;

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