"use strict";

var eventemitter = require('../eventemitter'),
    clone = require('clone'),
    shortid = require('shortid'),
    Promise = require('bluebird'),
    storage = require('../store'),
    eventHandlers = require("./handlers")();

class FoosEventEngine { 
  constructor() 
  {

  }

  importData(newplayers, events) 
  {
    var self = this;
    console.log(newplayers);
    newplayers.forEach(function(player) {
      storage.storePlayer(player);
    })
    storage.clearEvents();
    self.initializeState();

    events.forEach((ev) => {
      storage.storeEvent(ev);
    });

    return self.applyEvents();
  }

  initializeState()
  {
    var self = this;
    self._playerState = {};
    storage.getAllPlayers().forEach((player) => {
      self._playerState[player._id] = {
        rank: 1200, 
        doublesWon: 0,
        doublesLost: 0, 
        singlesWon: 0, 
        singlesLost: 0
      }
    })
    storage.storeSnapshot({ _id: 'init', players: clone(this._playerState, false, 2) });

    storage.getAllSnapshots();

    this._playerEvents = {};
    this._currentEvent = null;
    storage.getLastSnapshot((err, snapshot) => {
      if (err)
        console.log("Error when finding last snapshot", err);
      else {
        self._playerState = snapshot.players;
        self._currentEvent = snapshot._id !== 'init' ? snapshot._id : null;
      }
    }) 

  }

  applyEvents() 
  {
    var self = this;
    return new Promise((resolve, reject) => {
      Promise.all([
        storage.getLastSnapshot(),
        storage.getAllEvents()
      ]).
      spread((snapshot, events) => {
        return new Promise((resolve) => {
          var scope = new ApplyEventScope(snapshot.players)
          var eventsToHandle = [];
          var eventIdx = events.findIndex(function(ev) { return (ev._id === snapshot._id); });
          if (eventIdx >= 0) 
          {
            console.log("skipping " + (eventIdx + 1) + " events");
            console.log("events:" + events.length);

            eventsToHandle = events.slice(eventIdx + 1);
          } else {
            eventsToHandle = events.slice(0);
          }
          resolve([scope, eventsToHandle]);
        })
      }).
      spread((scope, eventsToHandle) => {
        console.log(eventsToHandle.length);
        eventsToHandle
          .forEach(function(ev) {
            scope.setEventId(ev._id);
            if(typeof(eventHandlers[ev.type]) === "function") {
              eventHandlers[ev.type].apply(scope, [ev]);
              var snapshot = { _id: ev._id, time: ev.time, players: clone(scope.playerState, false, 2) };
              storage.storeSnapshot(snapshot);
              eventemitter.emit('snapshot', { eventId: ev._id, snapshot: snapshot, affectedPlayers: scope._affectedPlayers });
            }
          }, self)
      }).
      then(() => {
        storage
          .persist()
          .then(() => { 
            console.log("Persisted data"); 
            resolve();
          })
          .catch((err) => { 
            reject(err);
          })
      }).
      catch(reject)
    });
  }
}

class ApplyEventScope 
{
  constructor(state) {
    var self = this;
    this.playerState = clone(state, 2);
    this._affectedPlayers = [];
    this._eventId = null;

    this.increasePlayerProperty = (playerId, property, increase) => {
      var player = self.playerState[playerId];
      if (!player)
        throw { message: "Player " + playerId + " does not exist" };

      var current = (player[property] || 0);

      if (typeof(increase) === "function") increase = increase(current); // resolve increase

      player[property] = current + increase;

      if (self._affectedPlayers.indexOf(playerId) < 0) self._affectedPlayers.push(playerId);

      storage.storePlayerEventLink(playerId, self._eventId)
    }

    this.getPlayerState = (player) => {
      return self.playerState[player];
    }

    this.setEventId = (eventId) => {
      self._eventId = eventId;
    }
  }
}

module.exports = FoosEventEngine;