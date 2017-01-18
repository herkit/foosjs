"use strict";

var EventEmitter = require('events'),
    clone = require('clone'),
    shortid = require('shortid');

class FoosEventEngine extends EventEmitter { 
  constructor(store) 
  {
    super();
    this._store = store;
    this.eventDefinitions = require("./handlers")();
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
        doublesWon: 0,
        doublesLost: 0, 
        singlesWon: 0, 
        singlesLost: 0
      }
    })
    this._store.storeSnapshot({ _id: 'init', players: clone(this._playerState, false, 2) });

    this._store.getAllSnapshots();

    this._playerEvents = {};
    this._currentEvent = null;
    this._store.getLastSnapshot((err, snapshot) => {
      if (err)
        console.log("Error when finding last snapshot", err);
      else {
        self._playerState = snapshot.players;
        self._currentEvent = snapshot._id !== 'init' ? snapshot._id : null;
      }
    }) 

  }

  applyEvent(ev) 
  {
    var self = this;
    var definition = self.eventDefinitions[ev.type];

    if(definition) {
      if (typeof(definition.handler) === "function") {
        var scope = new ApplyEventScope(self);

        definition.handler.apply(scope, [ev]);
        
        var snapshot = { _id: ev._id, time: ev.time, players: clone(self._playerState, false, 2) };
        self._store.storeSnapshot(snapshot);
        super.emit('snapshot', { eventId: self._currentEvent, snapshot: snapshot, affectedPlayers: scope._affectedPlayers });
    
        self._currentEvent = ev._id;
      }
    }
  }

  applyEvents() 
  {
    var self = this;
    var snapshotToLoad = 'init';

    var events = self
      ._store
      .getAllEvents();
    var eventsToHandle = [];

    console.log("current event " + this._currentEvent);

    var eventIdx = (this._currentEvent) ? events.findIndex(function(ev) { return (ev._id === self._currentEvent); }) : -1;
    if (eventIdx >= 0) 
    {
      console.log("skipping " + (eventIdx + 1) + " events");
      console.log("events:" + events.length);

      eventsToHandle = events.slice(eventIdx + 1);
      snapshotToLoad = events[eventIdx]._id;
    } else {
      eventsToHandle = events;
    }

    console.log("handling " + eventsToHandle.length + " events");

    self
      ._store
      .getSnapshotById(snapshotToLoad)
      .then((snapshot) => { 
        self._playerState = snapshot.players; 
      })
      .then(() => {
        eventsToHandle
          .forEach(function(ev) {
            this.applyEvent(ev);
          }, self)
      })
      .then(() => {
        self.emit('eventsapplied', this._currentEvent);
      })
      .then(
        self
          ._store
          .persist()
          .then(() => { 
            console.log("Persisted data"); 
          })
          .catch((err) => { 
            console.log("Persist error: ", err); 
          })
      );
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

}

class ApplyEventScope 
{
  constructor(engine) {
    this._affectedPlayers = [];

    this.increasePlayerProperty = (playerId, property, increase) => {
      var player = engine._playerState[playerId];
      if (!player)
        throw { message: "Player " + playerId + " does not exist" };

      var current = (player[property] || 0);

      if (typeof(increase) === "function") increase = increase(current); // resolve increase

      player[property] = current + increase;

      if (this._affectedPlayers.indexOf(playerId) < 0) this._affectedPlayers.push(playerId);

      this.storePlayerEventLink(playerId, this._currentEvent);
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