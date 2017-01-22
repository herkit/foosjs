angular.
  module('foosjsApp').
  factory('foosPlayers', function($rootScope, $http) {
    var availablePlayers = [];
    $http
      .get('/table')
      .then(function(response) {
        availablePlayers = response.data;
        availablePlayers.sort(
          function(a, b) 
          { 
            if (a.gamesPlayed > b.gamesPlayed) return -1;
            if (a.gamesPlayed < b.gamesPlayed) return 1;
            return 0;
          }
        )
      });

    return {
      getPlayerMatches: function(search) {
        return availablePlayers
          .filter(function(player) {
            return player.name.toLowerCase().startsWith(search.toLowerCase());
          })
          .map(function(player) {
            return { value: player._id, display: player };
          });
      }
    }

  }).
  value('version', '0.1');

