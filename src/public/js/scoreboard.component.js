'use strict';

angular.
  module('foosjsApp').
  component("scoreBoard", {
    template: 
      '<ul>' +
        '<li ng-repeat="player in $ctrl.scoreboard">' +
          '<span>{{player.name}}</span>' +
          '<p>{{player.rank}}</p>' +
        '</li>' +
      '</ul>',
    controller: function ScoreBoardController($http) {
      var self = this;
      $http.get('/table').then(function(response) {
        self.scoreboard = response.data;
      });
    }
  });