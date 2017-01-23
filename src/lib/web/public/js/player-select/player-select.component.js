'use strict';

function PlayerSelectController(foosPlayers) {
  var ctrl = this;

  ctrl.getPlayerMatches = function(search) {
    return foosPlayers.getPlayerMatches(search, ctrl.notavailable);
  };

  ctrl.selectedPlayerChange = function(player) {
    ctrl.onPlayerSelected({player: player});
  }
}

angular.
  module('foosjsApp').
  component("playerSelect", {
    templateUrl: 'js/player-select/player-select.template.html',
    controller: PlayerSelectController,
    bindings: {
      placeholder: '@',
      player: '<',
      notavailable: '<',
      onPlayerSelected: '&'
    }
  });