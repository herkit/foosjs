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

      var scope = new ApplyEventScope(self);
      self.eventHandlers[ev.type].apply(scope, [ev]);

      var snapshot = { _id: self._currentEvent, time: ev.time, players: clone(self._playerState, false, 2) };
      self._store.storeSnapshot(snapshot);
      super.emit('snapshot', { eventId: self._currentEvent, snapshot: snapshot, affectedPlayers: scope._affectedPlayers });
    }
  }  

  applyEvents() 
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
      }, self);

    self.emit('eventsapplied', this._currentEvent);

    self
      ._store
      .persist()
      .then(() => { 
        console.log("Persisted data"); 
      })
      .catch((err) => { 
        console.log("Persist error: ", err); 
      });
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

    if (this._affectedPlayers.indexOf(player) < 0) this._affectedPlayers.push(player);

    this._store.storePlayerEventLink(player, this._currentEvent);
  }
}

class ApplyEventScope 
{
  constructor(engine) {
    this._affectedPlayers = [];

    this.increasePlayerProperty = (player, property, increase) => {
      var current = (engine._playerState[player][property] || 0);

      if (typeof(increase) === "function") {
        engine._playerState[player][property] = current + increase(current);
      } else {
        engine._playerState[player][property] = current + increase;
      }

      if (this._affectedPlayers.indexOf(player) < 0) this._affectedPlayers.push(player);

      this.storePlayerEventLink(player, this._currentEvent);
    }

    this.storePlayerEventLink = (player) => {
      engine._store.storePlayerEventLink(player, engine._currentEvent)
    }

    this.getPlayerState = (player) => {
      return engine._playerState[player];
    }
  }
}

module.exports = FoosEventEngine;