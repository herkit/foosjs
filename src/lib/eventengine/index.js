var EventEmitter = require('events'),
    clone = require('clone');

class FoosEventEngine extends EventEmitter { 
  constructor() 
  {
    super();
    this._players = {};
    this._events = [];
    this.eventHandlers = require("./handlers")();
  }

  loadData(players, events) 
  {
    this._players = players;
    this._playerEvents = {};
    this._events = events;
    this._currentEvent = null;
    this._snapshots = { 
      'init': { players: clone(this._players, false, 2) } 
    };
    this.emit('snapshot', 'init', this._snapshots['init']);
  }

  applyEvent(ev) 
  {
    var self = this;
    if(typeof(self.eventHandlers[ev.type]) === "function") {
      self.eventHandlers[ev.type].apply(self, [self._players, ev]);
      self._currentEvent = ev._id;
      self._snapshots[self._currentEvent] = { time: ev.time, players: clone(self._players, false, 2) };
      self.emit('snapshot', self._currentEvent, self._snapshots[self._currentEvent]);
    }
  }
  
  applyEvents() 
  {
    this._events.forEach(this.applyEvent, this);
  }

  increasePlayerProperty(playerTable, player, property, increase, eventId) 
  {
    playerTable[player][property] = (playerTable[player][property] || 0) + increase;
    /*if (typeof(eventId) === "string") {
      if (typeof(playerTable[player].events) === "undefined") playerTable[player].events = [];
      if (playerTable[player].events.indexOf(eventId) < 0) playerTable[player].events.push(eventId);
    }*/
  }

  get playerTable() 
  {
    var self = this;
    var playerTable = Object
      .keys(self._players)
      .map(function(k) {
        var player = clone(self._players[k]);
        player.gamesPlayed = player.singlesWon + player.singlesLost + player.doublesWon + player.doublesLost;
        return player;
      });
    playerTable.sort(function(a, b) {
      if (a.gamesPlayed < 10 && b.gamesPlayed > 10) return 1;
      if (a.gamesPlayed > 10 && b.gamesPlayed < 10) return -1;
      if (a.rank < b.rank) return 1;
      if (a.rank > b.rank) return -1;

      return 0;
    });
    return playerTable;
  }

}

module.exports = FoosEventEngine;