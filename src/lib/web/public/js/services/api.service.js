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

angular.
  module('foosjsApp').
  factory('foosWss', function($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  })

angular.
  module('foosjsApp').
  factory('foosScoreboard', function($rootScope, $http) {

  });

