'use strict';

angular.
  module('foosjsApp').
  component("scoreBoard", {
    templateUrl: 'js/score-board/score-board.template.html',
    bindings: {
      onSelectedPlayersChanged: '&'
    },
    controller: function ScoreBoardController($http, foosWss, foosPlayers) {
      var self = this;
      var query = encodeURIComponent(`{
        scoreboard { 
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
        self.scoreboard = response.data.data.scoreboard;
      });

      foosWss.on('snapshot', function (data) {
        $http.get('/graph?query=' + query).then(function(response) {
          self.scoreboard = response.data.data.scoreboard;
        });        
      })

      self.hasSelectedPlayers = false;

      self.selectedPlayersChanged = function() {
        var selectedPlayerIds = self.scoreboard.players.filter(function(record) {
          return (record.selected);
        }).map(function(record) { return record.player._id; });
        self.onSelectedPlayersChanged({playerIds: selectedPlayerIds});
        self.hasSelectedPlayers = (selectedPlayerIds.length > 0);
      }
      
      self.gotoPlayer = function(ev, playerId) {
        foosPlayers.editPlayer(ev, playerId);
      }
    }
  });