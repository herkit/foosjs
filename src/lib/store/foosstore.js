"use strict";

var Promise = require('bluebird'),
    shortid = require('shortid');

var db = {
  _players: [],
  _events: [],
  _snapshots: [],
  _playerEvents: {}
}

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
    db._players = [],
    db._events = [],
    db._snapshots = [],
    db._playerEvents = {};
  }

  _findNextEventSeqNo() 
  {
    if (_events.length > 0) {
      return _events[_events.length - 1].seqNo + 1;
    } else {
      return 1;
    }
  }

  storePlayer(player, callback)
  {
    if (!player._id) player._id = shortid.generate();
    var idx = db._players.findIndex(byId(player._id));
    
    if (idx > -1) {
      db._players[idx] = player;
    } else {
      db._players.push(player);
    }

    if (typeof(callback) === 'function') 
      callback();
  }

  storePlayerEventLink(player, ev, callback) 
  {
    if (typeof(db._playerEvents[player]) === "undefined") 
      db._playerEvents[player] = [];

    if (db._playerEvents[player].indexOf(ev) < 0) 
      db._playerEvents[player].push(ev);

    if (typeof(callback) === 'function') 
      callback();
  }

  storeEvent(ev)
  {
    return new Promise((resolve, reject) => {
      if (!ev._id) ev._id = shortid.generate();
      if (!ev.seqNo) ev.seqNo = _findNextEventSeqNo();

      var idx = db._events.findIndex(byId(ev._id));

      if (idx > -1) { // ensure that we don's mess up the order
        ev.time = db._events[idx].time;
        ev.seqNo = db._events[idx].seqNo;
        _events[idx] = ev;
      } else {
        _events.push(ev);
      }

      resolve(ev);
    })
  }

  clearEvents() {
    db._events = [];
    db._snapshots = [];
    db._playerEvents = {};
  }

  storeSnapshot(snapshot, callback) 
  {
    if (snapshot._id) {
      var idx = db._snapshots.findIndex(byId(snapshot._id));
      if (idx > -1) {
        db._snapshots[idx] = snapshot;
      } else {
        db._snapshots.push(snapshot);
      }
    } else {
      callbackOrThrow({ error: 'Invalid snapshot, must have _id property set'}, callback);
    }
  }

  getLastSnapshot(callback) 
  {
    if (db._snapshots.length > 0) {
      var snapshot = db._snapshots[db._snapshots.length - 1];

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
    if (typeof(callback) === "function")
      callback(null, db._players);
    else
      return db._players;
  }

  getAllEvents(callback) 
  {
    if (typeof(callback) === "function")
      callback(null, db._events);
    else
      return db._events;
  }

  getAllSnapshots(callback) 
  {
    if (typeof(callback) === "function")
      callback(null, db._snapshots);
    else
      return db._snapshots;
  }

  getPlayerById(id, callback) 
  {
    var element = db._players.find(byId(id));
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
      var events = db._playerEvents[id];
      if (events)
        resolve(events);
      else
        reject({ error: "Player events not found: " + id})
    })
  }

  getEventById(id) 
  {
    return new Promise((resolve, reject) => {
      var element = db._events.find(byId(id));
      if (element)
        resolve(element);
      else
        reject({ error: "Event not found: " + id})
    })
  }

  getSnapshotById(id) 
  {
    return new Promise((resolve, reject) => {
      var element = db._snapshots.find(byId(id));
      if (element)
        resolve(element);
      else
        reject({ error: "Snapshot not found: " + id});
    })
  }

  _setPlayers(players) {
    db._players = players;
  }

  _setSnapshots(snapshots) {
    db._snapshots = snapshots;
  }

  _setPlayerEvents(playerEvents) {
    db._playerEvents =  playerEvents;
  }

  _setEvents(events) {
    db._events = events;
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