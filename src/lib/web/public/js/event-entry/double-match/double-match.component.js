'use strict';

function DoubleMatchEntryController() {
  var ctrl = this;
  ctrl.matchevent = {
    type: 'doublematch',
    data: {

    }
  }

  ctrl.playerSelect = function(prop, player) {
    ctrl.matchevent.data[prop] = player._id;
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