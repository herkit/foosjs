'use strict';

angular.
  module('foosjsApp').
  component("doubleMatch", {
    bindings: {
      match: '<',
    },
    templateUrl: 'js/event-entry/double-match/double-match.template.html',
    controller: function DoubleMatchEntryController($http) {
      var self = this;
      self.clearValue = function() {
        self.match.winner_1 = undefined;
        self.match.winner_2 = undefined;
        self.match.loser_1 = undefined;
        self.match.loser_2 = undefined;
        self.doubleMatchForm.$setPristine();;
      }
      self.save = function() {
        if(self.doubleMatchForm.$valid) {

        } else {
          alert('Form was invalid!');
        }
      }
    }
  });