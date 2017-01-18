angular.
  module('foosjsApp').
  factory('foosPlayers', function($rootScope) {
    var availablePlayers[];
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
      getPlayerMatches: function(input) {

      }
    }

  }).
  value('version', '0.1');
