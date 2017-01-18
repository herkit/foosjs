'use strict';

angular.
  module('foosjsApp').
  component("scoreBoard", {
    templateUrl: 'js/score-board/score-board.template.html',
    controller: function ScoreBoardController($http) {
      var self = this;
      $http.get('/table').then(function(response) {
        self.scoreboard = response.data;
      });
      self.gotoPlayer = function(playerId) {
        console.log("Loading player", playerId);
      }
    }
  });