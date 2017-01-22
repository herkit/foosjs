'use strict';

angular.
  module('foosjsApp').
  component("playerSelect", {
    bindings: {
      placeholder: '@',
      selectedPlayer: '<'
    },
    templateUrl: 'js/player-select/player-select.template.html',
    controller: function PlayerSelectController($http, foosPlayers) {
      var self = this;

      /*$http.get('/table').then(function(response) {
        self.availablePlayers = response.data;
        self.availablePlayers.sort(
          function(a, b) 
          { 
            if (a.gamesPlayed > b.gamesPlayed) return -1;
            if (a.gamesPlayed < b.gamesPlayed) return 1;
            return 0;
          }
        )
      });

      self.availablePlayers = [];*/
      self.selectedItem = null;
      self.getPlayerMatches = function(search) {
        return foosPlayers.getPlayerMatches(search);
        /*console.log("Searching for " + search, self.availablePlayers);
        var result = self
          .availablePlayers
          .filter(function(player) {
            return player.name.toLowerCase().startsWith(search.toLowerCase());
          })
          .map(function(player) {
            return { value: player._id, display: player };
          });
        console.log(result);
        return result;*/
      }
    }
  });