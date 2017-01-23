'use strict';

function DoubleMatchEntryController() {
  var ctrl = this;
  ctrl.selectedPlayers = [];
  ctrl.matchevent = {
    type: 'doublematch',
    data: {

    }
  }

  ctrl.playerSelect = function(prop, player) {
    ctrl.matchevent.data[prop] = player._id;
    ctrl.selectedPlayers = [ctrl.matchevent.data['winner_1'], ctrl.matchevent.data['winner_2'], ctrl.matchevent.data['loser_1'], ctrl.matchevent.data['loser_2']];
    ctrl.onUpdate({matchevent: ctrl.matchevent});
  }
}

angular.
  module('foosjsApp').
  component("doubleMatch", {
    bindings: {
      onUpdate: '&'
    },
    templateUrl: 'js/event-entry/double-match/double-match.template.html',
    controller: DoubleMatchEntryController
  });