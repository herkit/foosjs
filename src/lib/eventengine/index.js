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
    return storage.importData({ players: newplayers, events: events});
  }

  initializeState()
  {
    return storage.
    getAllPlayers().
    reduce((playerState, player) => {
      playerState[player._id] = {
        rank: 1200, 
        doublesWon: 0,
        doublesLost: 0, 
        singlesWon: 0, 
        singlesLost: 0
      }
      return playerState;
    }, {}).
    then((playerState) => {
      return storage.storeSnapshot({ _id: 'init', players: clone(playerState, false, 2) });
    });
  }

  applyEvents(from) 
  {
    var self = this;
    self.initializeState(); // Ensure that we have a initial snapshot

    var getSnapshot = storage.getLastSnapshot();
    if (from && from > "") {
      getSnapshot = storage.getSnapshotById(from)
    }

    return new Promise((resolve, reject) => {
      Promise.all([
        getSnapshot,
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
              scope._affectedPlayers = [];
              eventHandlers[ev.type].apply(scope, [ev]);
              var snapshot = { _id: ev._id, time: ev.time, players: clone(scope.playerState, false, 2) };
              var affectedPlayers = scope._affectedPlayers.slice(0);
              storage.
              storeSnapshot(snapshot).
              then(() => {
                eventemitter.emit('snapshot', { eventId: ev._id, snapshot: snapshot, affectedPlayers: affectedPlayers });  
              }).
              catch((err) => {
                console.log(err);
              });
            }
          }, self)
      }).
      then(() => {
        console.log("persisting");
        return storage
          .persist()
          .then(() => {
            console.log("done persisting");
            resolve();
          })
      }).
      catch((err) => {
        console.log("applyEvents error", err)
      })
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

      storage.
      storePlayerEventLink(playerId, self._eventId).
      then((stored) => { 
        if (stored)
          console.log("Added link between player " + stored.playerId + " and event " + stored.eventId); 
        return true; 
      }).return(true);
    }

    this.getPlayerState = (player) => {
      return self.playerState[player];
    }

    this.setEventId = (eventId) => {
      console.log("Handling event " + eventId);
      self._eventId = eventId;
    }
  }
}

module.exports = FoosEventEngine;