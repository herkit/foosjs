'use strict';

function SingleMatchEntryController($http) {
  var ctrl = this;
  ctrl.matchevent = {
    type: 'singlematch',
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
  component("singleMatch", {
    bindings: {
      onUpdate: '&'
    },
    templateUrl: 'js/event-entry/single-match/single-match.template.html',
    controller: SingleMatchEntryController
  });