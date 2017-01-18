'use strict';

angular.
  module('foosjsApp').
  component("singleMatch", {
    bindings: {
      match: '<',
    },
    templateUrl: 'js/event-entry/single-match/single-match.template.html',
    controller: function SingleMatchEntryController($http) {
      var self = this;
      self.clearValue = function() {
        self.match.winner_1 = undefined;
        self.match.loser_1 = undefined;
        self.singleMatchForm.$setPristine();;
      }
      self.save = function() {
        if(self.singleMatchForm.$valid) {

        } else {
          alert('Form was invalid!');
        }
      }
    }
  });