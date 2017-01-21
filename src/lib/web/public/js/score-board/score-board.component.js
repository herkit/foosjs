'use strict';

angular.
  module('foosjsApp').
  component("scoreBoard", {
    templateUrl: 'js/score-board/score-board.template.html',
    controller: function ScoreBoardController($http) {
      var self = this;
      var query = encodeURIComponent(`{
        lastSnapshot { 
          _id, 
          time, 
          players {
            player {_id, name, avatar}
            rank
            gamesPlayed
            singlesWon
            singlesLost
            doublesWon
            doublesLost
          }
        }
      }`);
      $http.get('/graph?query=' + query).then(function(response) {
        self.scoreboard = response.data.data.lastSnapshot;
      });
      self.gotoPlayer = function(playerId) {
        console.log("Loading player", playerId);
      }
    }
  });