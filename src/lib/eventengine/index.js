"use strict";

var EventEmitter = require('events'),
    clone = require('clone'),
    shortid = require('shortid');

class FoosEventEngine extends EventEmitter { 
  constructor(store) 
  {
    super();
    this._store = store;
    this.eventHandlers = require("./handlers")();
    this.initializeState();
    this.applyEvents();
  }

  importData(newplayers, events) 
  {
    var self = this;
    console.log(newplayers);
    newplayers.forEach(function(player) {
      self._store.storePlayer(player);
    })
    self._store.clearEvents();
    self.initializeState();

    events.forEach((ev) => {
      self._store.storeEvent(ev);
    });

  }

  initializeState()
  {
    var self = this;
    self._playerState = {};
    self._store.getAllPlayers().forEach((player) => {
      self._playerState[player._id] = {
        rank: 1200, 
        doublesPlayed: 0, 
        doublesWon: 0,
        doublesLost: 0, 
        singlesPlayed: 0, 
        singlesWon: 0, 
        singlesLost: 0
      }
    })
    this._playerEvents = {};
    this._currentEvent = null;
    this._store.getLastSnapshot((err, snapshot) => {
      if (err)
        console.log("Error when finding last snapshot", err);
      else
        this._store._currentEvent = snapshot._id;
    }) 

    this._store.storeSnapshot({ _id: 'init', players: clone(this._playerState, false, 2) });
  }

  applyEvent(ev) 
  {
    var self = this;
    if(typeof(self.eventHandlers[ev.type]) === "function") {
      self._currentEvent = ev._id;
      self.eventHandlers[ev.type].apply(self, [ev]);
      var snapshot = { _id: self._currentEvent, time: ev.time, players: clone(self._playerState, false, 2) };
      self._store.storeSnapshot(snapshot);
      super.emit('snapshot', self._currentEvent, snapshot);
    }
  }
  
  applyEvents(callback) 
  {
    var self = this;
    var reachedCurrentEvent = (this._currentEvent == null);

    self
      ._store
      .getAllEvents()
      .forEach(function(ev) {
        if (reachedCurrentEvent)
          this.applyEvent(ev);
        if (ev._id === this._currentEvent)
          reachedCurrentEvent = true;

        self.emit('eventsapplied');
      }, self);

    if (typeof(callback) === "function") {
      callback(null);
    } else {
      return;
    }
  }

  addEvent(ev) {
    console.log(ev);
    var seqNo = this._events[this._events.length - 1].seqNo + 1;
    ev.seqNo = seqNo;
    ev._id = shortid.generate();
    ev.time = new Date();
    this._events.push(ev);
    this.applyEvents();
    return ev;
  }

  loadSnapshot(eventId)
  {
    this._players = clone(this._snapshots[eventId], false, 3);
    if (eventId === "init") {
      this._currentEvent = null;
    } else {
      this._currentEvent = eventId;
    }
  }

  increasePlayerProperty(player, property, increase) 
  {
    var current = (this._playerState[player][property] || 0);

    if (typeof(increase) === "function") {
      this._playerState[player][property] = current + increase(current);
    } else {
      this._playerState[player][property] = current + increase;
    }

    this._store.storePlayerEventLink(player, this._currentEvent);
  }

  get playerTable() 
  {
    var self = this;
    self._store.getAllPlayers().map((player) => {});
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

  get allSnapshots() 
  {
    return this._snapshots;
  }

  getSnapshot(snapshotId)
  {
    return this._snapshots[snapshotId];
  }
}

module.exports = FoosEventEngine;