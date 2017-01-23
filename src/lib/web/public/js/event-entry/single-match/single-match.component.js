'use strict';

function SingleMatchEntryController($http) {
  var ctrl = this;
  ctrl.selectedPlayers = [];
  ctrl.matchevent = {
    type: 'singlematch',
    data: {

    }
  }

  ctrl.playerSelect = function(prop, player) {
    ctrl.matchevent.data[prop] = player._id;
    ctrl.selectedPlayers = [ctrl.matchevent.data['winner_1'], ctrl.matchevent.data['loser_1']];
    ctrl.onUpdate({matchevent: ctrl.matchevent});
  }
}

angular.
  module('foosjsApp').
  component("singleMatch", {
    bindings: {
      onUpdate: '&'
    },
    templateUrl: 'js/event-entry/single-match/single-match.template.html',
    controller: SingleMatchEntryController
  });