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

  storePlayer(player)
  {
    return new Promise((resolve, reject) => {
      var isNewPlayer = false;
      if (!(player.name && player.name > "")) {
        reject({ error: "Player.name is required"});
      }

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

      resolve(player);
    })
  }

  storePlayerEventLink(playerId, eventId, callback) 
  {
    return new Promise((resolve) => {
      if (typeof(db._playerEvents[playerId]) === "undefined") 
        db._playerEvents[playerId] = [];

      if (db._playerEvents[playerId].indexOf(eventId) < 0) {
        db._playerEvents[playerId].push(eventId);
        resolve({ playerId: playerId, eventId: eventId });
      } else {
        resolve(false);
      }
    })
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

  getAllPlayers() 
  {
    return new Promise((resolve) => {
      resolve(db._players);
    });
  }

  getAllEvents() 
  {
    return new Promise((resolve) => {
      resolve(db._events);
    });
  }

  getAllSnapshots() 
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

  importData(data) {
    var self = this;
    return new Promise((resolve) => {
      console.log("importing", data.players.length, " players and ", data.events.length, "events")
      data.players.forEach(function(player) {
        self.storePlayer(player);
      })
      console.log("imported players");
      self.clearEvents();
      data.events.forEach((ev) => {
        self.storeEvent(ev);
      });  
      console.log("imported events");
      resolve();
    });
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