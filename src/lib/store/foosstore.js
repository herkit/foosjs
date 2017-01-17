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
    if (typeof(this._playerEvents[player]) === "undefined") 
      this._playerEvents[player] = [];

    if (this._playerEvents[player].indexOf(ev) < 0) 
      this._playerEvents[player].push(ev);

    if (typeof(callback) === 'function') 
      callback();
  }

  storeEvent(ev, callback)
  {
    if (!ev._id) ev._id = shortid.generate();
    var idx = this._events.findIndex(byId(ev._id));

    if (idx > -1) { // ensure that we don's mess up the order
      ev.time = this._events[idx].time;
      ev.seqNo = this._events[idx].seqNo;
      this._events[idx] = ev;
    } else {
      this._events.push(ev);
    }

    if (typeof(callback) === 'function') 
      callback();
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

  getPlayerEvents(id, callback) 
  {
    var events = this._playerEvents[id];
    if (events)
      if (typeof(callback) === "function") 
        callback(null, events);
      else
        return events;
    else
      callbackOrThrow({ error: "Player events not found: " + id})
  }

  getEventById(id, callback) 
  {
    var element = this._events.find(byId(id));
    if (element)
      if (typeof(callback) === "function") 
        callback(null, element);
      else
        return element;
    else
      callbackOrThrow({ error: "Event not found: " + id})
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

  persist(callback) {
    if (typeof(callback) === "function") 
      callback();
  }

  initialize() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

}

module.exports = FoosStore;