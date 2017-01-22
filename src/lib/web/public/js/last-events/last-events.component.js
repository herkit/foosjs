'use strict';

angular.
  module('foosjsApp').
  component("lastEvents", {
    bindings: {
      count: '<',
      placeholder: '@',
      selectedPlayer: '<'
    },
    templateUrl: 'js/last-events/last-events.template.html',
    controller: function LastEventsController($http) {
      var query = encodeURIComponent(`{
        events(first:5) {
          _id 
          time
          type
          seqNo
          ... on DoubleMatchEvent { 
            winner_1 { _id name avatar }
            winner_2 { _id name avatar }
            loser_1 { _id name avatar }
            loser_2 { _id name avatar }
          }
          ... on SingleMatchEvent {
            winner_1 { _id name avatar }
            loser_1 { _id name avatar }
          }
        }
      }`);

      var self = this;

      $http.get('/graph?query=' + query).then(function(response) {
        self.events = response.data.data.events;
      });

      self.events = [];
    }
  });