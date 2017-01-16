var EventEmitter = require('events'),
    clone = require('clone');

class FoosEventEngine extends EventEmitter { 
  constructor() 
  {
    super();
    this._players = {};
    this.eventHandlers = require("./handlers")();
  }

  loadData(players, events) 
  {
    console.log("Loading data");
    this._players = players;
    this._playerEvents = {};
    this._events = events;
    this._currentEvent = null;
    this._snapshots = { 
      'init': { players: clone(this._players, false, 2) } 
    };
    this.emit('snapshot', 'init', this._players);
  }

  applyEvent(ev) 
  {
    var self = this;
    if(typeof(self.eventHandlers[ev.type]) === "function") {
      self.eventHandlers[ev.type](self._players, ev);
      self._currentEvent = ev._id;
      self._snapshots[self._currentEvent] = { time: ev.time, players: clone(self._players, false, 2) };
      self.emit('snapshot', self._currentEvent, self._snapshots[self._currentEvent]);
    }
  }
  
  applyEvents() 
  {
    this._events.forEach(this.applyEvent, this);
  }
}

module.exports = FoosEventEngine;