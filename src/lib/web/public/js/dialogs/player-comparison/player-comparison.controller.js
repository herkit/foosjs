'use strict';

function getPlayerEventIds(player) {
  return player.history.map(function(historyItem) { return historyItem.event._id });
}

function notPlayer(id) {
  return function(player) { return player._id != id; }
}

function PlayerComparisonController($scope, $http, $mdDialog, players) {
  var ctrl = this;

  $scope.players = players;
  console.log(players);

  var query = encodeURIComponent(`query getPlayersHistory($ids:[ID]) {
    players(ids:$ids) {
      _id name avatar
      history 
      {
        event { 
          _id time type
          ... on DoubleMatchEvent { 
            winner_1 { _id }
            winner_2 { _id }
            loser_1 { _id }
            loser_2 { _id }
          }
          ... on SingleMatchEvent {
            winner_1 { _id }
            loser_1 { _id }
          } 
        } 
        rank
      }
    }
  }`);
  var variables = encodeURIComponent(JSON.stringify({ ids: players }));

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $http.get('/graph?query=' + query + '&variables=' + variables).then(function(result) {
    var wonAgainst = {};
    var players = result.data.data.players;

    var comparison = players.reduce(function(relations, player) {
      var playerEventIds = getPlayerEventIds(player);
      var otherPlayers = players
        .filter(notPlayer(player._id));

      console.log("player", player);
      //console.log(playerEventIds);

      var stats = otherPlayers.reduce(function(stats, otherPlayer) {
        var otherPlayerEventIds = getPlayerEventIds(otherPlayer);
        var sharedPlayerEventIds = playerEventIds.filter(function(eventId) { return (otherPlayerEventIds.indexOf(eventId) >= 0); });
        //console.log("shared event ids", sharedPlayerEventIds);
        var sharedEvents = otherPlayer.history.filter(function(historyEntry) {
          return (playerEventIds.indexOf(historyEntry.event._id) >= 0);
        }).map(function(historyEntry) {
          return {
            winners: [historyEntry.event.winner_1, historyEntry.event.winner_2].filter(function(player) { return (player != undefined); }).map(function(player) { return player._id; }),
            losers: [historyEntry.event.loser_1, historyEntry.event.loser_2].filter(function(player) { return (player != undefined); }).map(function(player) { return player._id; })
          }
        })
        console.log("otherPlayer", otherPlayer);
        console.log(sharedEvents);

        var currentStat = {
          id: otherPlayer._id,
          name: otherPlayer.name,
          avatar: otherPlayer.avatar,
          wonwith: sharedEvents
            .filter(function(ev) { 
              return (
                (ev.winners.indexOf(player._id) >= 0) &&
                (ev.winners.indexOf(otherPlayer._id) >= 0)
              ); 
            }).length,
          lostwith: sharedEvents.filter(function(event) { return (event.losers.indexOf(player._id) >= 0 && event.losers.indexOf(otherPlayer._id) >= 0); }).length,
          wonagainst: sharedEvents.filter(function(event) { return (event.winners.indexOf(player._id) >= 0 && event.losers.indexOf(otherPlayer._id) >= 0); }).length,
          lostagainst: sharedEvents.filter(function(event) { return (event.losers.indexOf(player._id) >= 0 && event.winners.indexOf(otherPlayer._id) >= 0); }).length,
        };
        stats.push(currentStat);
        return stats;
      }, []);

      relations.push({ id: player._id, name: player.name, avatar: player.avatar, comparisons: stats });
      return relations;
    }, []);
    $scope.comparison = comparison;
    console.log("comparison", comparison);
  })
}