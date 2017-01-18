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
      var self = this;

      $http.get('/events/last/' + self.count).then(function(response) {
        self.events = response.data;
      });

      self.events = [];
    }
  });