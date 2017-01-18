"use strict";

var Promise = require('bluebird'),
    shortid = require('shortid');

function byId(id) {
  return function(element) {
    return (element._id === id);
  }
}

function callbackOrThrow(err, callback) {
  if (typeof(callback) === "function") {
    callback(err);
  } else {
    throw err;
  }
}

class FoosStore {
  constructor(options) {
    this._players = [];
    this._events = [];
    this._snapshots = [];
    this._playerEvents = {};
  }

  _findNextEventSeqNo() 
  {
    if (this._events.length > 0) {
      return this._events[this._events.length - 1].seqNo + 1;
    } else {
      return 1;
    }
  }

  storePlayer(player, callback)
  {
    if (!player._id) player._id = shortid.generate();
    var idx = this._players.findIndex(byId(player._id));
    
    if (idx > -1) {
      this._players[idx] = player;
    } else {
      this._players.push(player);
    }

    if (typeof(callback) === 'function') 
      callback();
  }

  storePlayerEventLink(player, ev, callback) 
  {
    var self = this;
    if (typeof(self._playerEvents[player]) === "undefined") 
      self._playerEvents[player] = [];

    if (self._playerEvents[player].indexOf(ev) < 0) 
      self._playerEvents[player].push(ev);

    if (typeof(callback) === 'function') 
      callback();
  }

  storeEvent(ev)
  {
    return new Promise((resolve, reject) => {
      if (!ev._id) ev._id = shortid.generate();
      if (!ev.seqNo) ev.seqNo = this._findNextEventSeqNo();

      var idx = this._events.findIndex(byId(ev._id));

      if (idx > -1) { // ensure that we don's mess up the order
        ev.time = this._events[idx].time;
        ev.seqNo = this._events[idx].seqNo;
        this._events[idx] = ev;
      } else {
        this._events.push(ev);
      }

      resolve(ev);
    })
  }

  clearEvents() {
    this._events = [];
    this._snapshots = [];
    this._playerEvents = {};
  }

  storeSnapshot(snapshot, callback) 
  {
    if (snapshot._id) {
      this._snapshots.push(snapshot);
    } else {
      callbackOrThrow({ error: 'Invalid snapshot, must have _id property set'}, callback);
    }
  }

  getLastSnapshot(callback) 
  {
    var self = this;
    if (self._snapshots.length > 0) {
      var snapshot = self._snapshots[self._snapshots.length - 1];
      if (typeof(callback) === "function")
        callback(null, snapshot);
      else
        return snapshot;
    } else {
      callbackOrThrow({ error: 'No present snapshots'}, callback);
    }
  }

  getAllPlayers(callback) 
  {
    var self = this;
    if (typeof(callback) === "function")
      callback(null, self._players);
    else
      return this._players;
  }

  getAllEvents(callback) 
  {
    if (typeof(callback) === "function")
      callback(null, this._events);
    else
      return this._events;
  }

  getAllSnapshots(callback) 
  {
    if (typeof(callback) === "function")
      callback(null, this._snapshots);
    else
      return this._snapshots;
  }

  getPlayerById(id, callback) 
  {
    var element = this._players.find(byId(id));
    if (element)
      if (typeof(callback) === "function") 
        callback(null, element);
      else
        return element;
    else
      callbackOrThrow({ error: "Player not found: " + id})
  }

  getPlayerEvents(id) 
  {
    return new Promise((resolve, reject) => {
      var events = this._playerEvents[id];
      if (events)
        resolve(events);
      else
        reject({ error: "Player events not found: " + id})
    })
  }

  getEventById(id) 
  {
    return new Promise((resolve, reject) => {
      var element = this._events.find(byId(id));
      if (element)
        resolve(element);
      else
        reject({ error: "Event not found: " + id})
    })
  }

  getSnapshotById(id, callback) 
  {
    var element = this._snapshots.find(byId(id));
    if (element)
      if (typeof(callback) === "function") 
        callback(null, element);
      else
        return element;
    else
      callbackOrThrow({ error: "Snapshot not found: " + id})
  }

  persist() {
    return new Promise((resolve) => {
      resolve();
    })
  }

  initialize() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

}

module.exports = FoosStore;