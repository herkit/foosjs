var storage = require('../store');

var root = {
  players: () => {
    return storage
      .getAllPlayers()
      .map(playerToGraph);
  },
}

function eventToGraph(e) {
  var output = { _id: e._id, type: e.type, time: e.time, what: e.what || "-" };
  /*if (event._type === "singlematch") {
    output.winner_1 = mapIdToPlayer(event.winner_1),
    output.loser_1 = mapIdToPlayer(event.loser_1)
  }*/
  return output;
}

function mapIdToPlayer(playerId) {
  var player = storage.getPlayerById(playerId);
  return playerToGraph(player);
}

function playerToGraph(p) {
  return { 
    name: p.name, 
    _id: p._id, 
    events: () => {
      var evs;
      return storage
        .getPlayerEvents(p._id)
        .filter((e) => { if (e) return true; else return false; })
        .map((evId) => {
          return storage.getEventById(evId);
        })
        .map(eventToGraph)
    },
    lastEvent: () => {
      return storage.
        getPlayerEvents(p._id).
        then((evs) => { 
          return evs.slice(-1)[0]; 
        }).
        then((evId) => { return storage.getEventById(evId); }).
        then(eventToGraph)
    }
  }
}

class Event {
  constructor(eventdata) {
    this.time = eventdata.time;
    this.type = eventdata.type;
    this._id = eventdata._id;
  }
}

class SingleMatchEvent {
  constructor(eventdata) {
    this.winner_1 = mapIdToPlayer(eventdata.winner_1);
    this.loser_1 = mapIdToPlayer(eventdata.loser_1);
  }
}

module.exports = root;