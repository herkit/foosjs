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
    if (db._events.length > 0) {
      return db._events[db._events.length - 1].seqNo + 1;
    } else {
      return 1;
    }
  }

  storePlayer(player, callback)
  {
    console.log("storePlayer", player);
    var isNewPlayer = false;
    if (!player._id){
      isNewPlayer = true;
      player._id = shortid.generate();
    } 
    var idx = db._players.findIndex(byId(player._id));
    
    if (idx > -1) {
      db._players[idx] = player;
    } else {
      db._players.push(player);
    }

    if (isNewPlayer) {
      db._snapshots.forEach(function(snapshot) {
        snapshot.players[player._id] = {
          "rank": 1200,
          "doublesWon": 0,
          "doublesLost": 0,
          "singlesWon": 0,
          "singlesLost": 0
        }
      })
    }

    if (typeof(callback) === 'function') 
      callback(null, player);
    else
      return player;
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
    var self = this;
    return new Promise((resolve, reject) => {
      var players = [ev.data['winner_1'], ev.data['winner_2'], ev.data['loser_1'], ev.data['loser_2']]
        .filter(function(v) { 
          return (v != undefined); 
        });
      players.sort();
      for (var i = 0; i < players.length - 1; i++) {
        if (players[i + 1] == players[i]) {
          reject({ message: "Player " + players[i] + " has been referred more than once" });
          return;
        }
      }

      if (!ev._id) ev._id = shortid.generate();
      if (!ev.seqNo) ev.seqNo = self._findNextEventSeqNo();
      if (!ev.time) ev.time = new Date().toISOString();

      var idx = db._events.findIndex(byId(ev._id));

      if (idx > -1) { // ensure that we don's mess up the order
        ev.time = db._events[idx].time;
        ev.seqNo = db._events[idx].seqNo;
        db._events[idx] = ev;
      } else {
        db._events.push(ev);
      }

      resolve(ev);
    })
  }

  clearEvents() {
    db._events = [];
    db._snapshots = [];
    db._playerEvents = {};
  }

  storeSnapshot(snapshot) 
  {
    return new Promise((resolve, reject) => {
      if (snapshot._id) {
        var idx = db._snapshots.findIndex(byId(snapshot._id));
        if (idx > -1) {
          db._snapshots[idx] = snapshot;
        } else {
          db._snapshots.push(snapshot);
        }
        resolve();
      } else {
        reject({ error: 'Invalid snapshot, must have _id property set'});
      }
    });
  }

  getLastSnapshot() 
  {
    return new Promise((resolve, reject) => {
      if (db._snapshots.length > 0) {
        var snapshot = db._snapshots[db._snapshots.length - 1];
        resolve(snapshot);
      } else {
        reject({ error: 'No present snapshots'});
      }
    });
  }

  getAllPlayers(callback) 
  {
    if (typeof(callback) === "function")
      callback(null, db._players);
    else
      return db._players;
  }

  getAllEvents() 
  {
    return new Promise((resolve) => {
      resolve(db._events);
    });
  }

  getAllSnapshots(callback) 
  {
    return new Promise((resolve) => {
      resolve(db._snapshots);
    });
  }

  getPlayerById(id) 
  {
    return new Promise((resolve, reject) => {
      var element = db._players.find(byId(id));
      if (element) {
        resolve(element);
      }
      else
        reject({ error: "Player not found: " + id})
    });
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

  getAllPlayerEvents() {
    return new Promise((resolve, reject) => {
      resolve(db._playerEvents);
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