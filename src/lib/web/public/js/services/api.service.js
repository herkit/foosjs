
function EditPlayerDialogController($scope, $mdDialog, player) 
{
  $scope.player = player;
  $scope.avatarPreview = player.avatar;
  $scope.pristineAvatar = player.avatar;

  if (!player.avatarIsSet) {
    $scope.player.avatarEdit = "";
    $scope.player.avatar = "";
  }

  $scope.avatarChanged = function() {
    $scope.player.avatarIsSet = ($scope.player.avatar !== "");
  }

  $scope.avatarBlur = function() {
    if (player.avatarIsSet)
      $scope.avatarPreview = $scope.player.avatar;
    else
      $scope.avatarPreview = $scope.pristineAvatar;
  }

  $scope.cancel = function() {
    $mdDialog.cancel();
  }

  $scope.save = function() {
    $mdDialog.hide($scope.player);
  }
}

angular.
  module('foosjsApp').
  factory('foosPlayers', function($rootScope, $http, $mdDialog) {
    var svc = this;
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

    svc.getPlayerMatches = function(search, notavailable) {
      var available = availablePlayers;
      if (notavailable) {
        available = available.filter(function(player) {
          return (notavailable.indexOf(player._id) < 0);
        });
      }
      return available
        .filter(function(player) {
          return player.name.toLowerCase().startsWith(search.toLowerCase());
        });
    };

    svc.getPlayerById = function(id) {
      var query = encodeURIComponent(`query getPlayerById($playerId: ID!) { player(_id: $playerId) { _id, name, email, avatar, avatarIsSet, state { gamesPlayed singlesWon singlesLost doublesWon doublesLost rank } } }`);
      var variables = encodeURIComponent(JSON.stringify({ playerId: id }));
      return $http.get("/graph?query=" + query + "&variables=" + variables);
    }

    svc.editPlayer = function(ev, id) {
      svc.getPlayerById(id).then(function(response) {
        console.log(response.data.data.player);
        $mdDialog.show({
          controller: EditPlayerDialogController,
          templateUrl: 'js/dialogs/edit-player/edit-player.template.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clicOutsideToClose:false,
          fullscreen:true,
          locals: {
            player: response.data.data.player
          }
        })
      }).then(function(toSave) {
        console.log(toSave);
      })
    }

    return svc;
  }).
  value('version', '0.1');


angular.
  module('foosjsApp').
  factory('foosWss', function($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        console.log(eventName);
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
  });

angular.
  module('foosjsApp').
  factory('foosScoreboard', function($rootScope, $http) {

  });

