"use strict";

var storage = require('../store'),
    Promise = require('bluebird'),
    FoosEventEngine = require('../eventengine'),
    engine = new FoosEventEngine();



const root = {
  Query: {
    players: (obj, query, context, info) => {
      console.log(query.ids);
      return storage.
        getAllPlayers().
        then((players) => {
          return players.filter(function(player) {
            if (query.exclude && query.exclude.indexOf(player._id) >= 0) 
              return false;
            if (query.ids)
              return (query.ids.indexOf(player._id) >= 0);
            return true;
          })
        }).
        map(playerToGraph);
    },
    player: (obj, query, context, info) => {
      return storage.
      getPlayerById(query._id).
      then((p) => {
        return playerToGraph(p);
      });
    },
    scoreboard: (obj, args, context, info) => {
      return Promise.all([
        storage.getLastSnapshot(),
        storage.getAllPlayers()
      ]).spread((snapshot, players) => {
        return {
          _id: snapshot._id,
          time: snapshot.time,
          players: () => 
            players.
            map((player) => {
              return Object.assign({ player: playerToGraph(player) }, snapshot.players[player._id]);
            }).
            map((player) => {
              player.gamesPlayed = player.singlesWon + player.singlesLost + player.doublesWon + player.doublesLost;
              return player;
            }).
            sort(function(a, b) {
              if (a.gamesPlayed < 10 && b.gamesPlayed > 10) return 1;
              if (a.gamesPlayed > 10 && b.gamesPlayed < 10) return -1;
              if (a.rank < b.rank) return 1;
              if (a.rank > b.rank) return -1;

              return 0;
            })
        };  
      }).catch((err) => {
        console.log(err);
      });
    },
    events: (obj, query, context, info) => {
      return storage.
      getAllEvents().
      then((events) => {
        var events = events.slice(0); 
        events.sort((a, b) => { if (a.seqNo > b.seqNo) return -1; if (a.seqNo < b.seqNo) return 1; return 0; });
        if (query.first) {
          var startIdx = 0;
          if (query.after)
          {
            startIdx = events.findIndex((ev) => { return ev._id == query.after; });
            if (startIdx > 0) 
              startIdx++;
            else
              startIdx = 0;
          }
          events = events.slice(startIdx, startIdx + query.first);
        }
        return events.map(eventToGraph);
      }).
      catch((err) => { console.log(err); });
    }
  },
  Mutation: {
    updatePlayer: (obj, query, context) => {  
      return storage.getPlayerById(query.id).
        then((p) => {
          p.name = query.input.name;
          p.email = query.input.email;
          p.avatar = query.input.avatar;
          return p;
        }).
        then((p) => {
          return storage.storePlayer(p)
        }).
        then((p) => {
          return playerToGraph(p);
        });
    },
    createPlayer: (obj, query) => {
      return Promise.promisify(storage.storePlayer)(query.input).
        then((p) => {
          return playerToGraph(p);
        });
    }
  },
  Event: {
    __resolveType(obj, context, info) {
      if (obj.type === 'doublematch')
        return 'DoubleMatchEvent';
      if (obj.type === 'singlematch')
        return 'SingleMatchEvent';
      return 'FoosEvent';
    }
  }
}

function eventToGraph(e) {
  var output = { 
    _id: e._id, 
    seqNo: e.seqNo, 
    type: e.type, 
    time: e.time, 
    what: e.what || "-", 
    winner_1: e.data.winner_1 ? mapIdToPlayer(e.data.winner_1) : null, 
    winner_2: e.data.winner_2 ? mapIdToPlayer(e.data.winner_2) : null, 
    loser_1: e.data.loser_1 ? mapIdToPlayer(e.data.loser_1) : null,
    loser_2: e.data.loser_2 ? mapIdToPlayer(e.data.loser_2) : null 
  };
  return output;
}

function mapIdToPlayer(playerId) {
  return storage.
  getPlayerById(playerId).
  then((player) => { 
    return playerToGraph(player); 
  });
}

function playerToGraph(p) {
  return Object.assign({
    avatar: () => {
      if (p.avatar && p.avatar > "") {
        return p.avatar;
      } else {
        if (p.email) {
          var md5 = require('crypto').createHash('md5');

          md5.update(p.email.toLowerCase().trim());
          return "https://www.gravatar.com/avatar/" + md5.digest('hex');
        }
      }
      return "img/icon/ic_face_black_24px.svg";      
    },
    avatarIsSet: () => {
      if (p.avatar) 
        return true;
      else
        return false;
    },
    events: () => {
      return storage
        .getPlayerEvents(p._id)
        .map(storage.getEventById)
        .then((events) => { events.sort((a, b) => { if (a.seqNo > b.seqNo) return -1; if (a.seqNo < b.seqNo) return 1; return 0; }); return events; })
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
    },
    state: () => {
      var snapshot = storage.getLastSnapshot().then((snapshot) => {
        var player = snapshot.players[p._id];
        return Object.assign({ 
          time: snapshot.time,
          event: storage.getEventById(snapshot._id).then(eventToGraph),
          gamesPlayed: player.singlesWon + player.singlesLost + player.doublesWon + player.doublesLost 
        }, player);  
      });
    },
    history: () => {
      return storage.
        getPlayerEvents(p._id).
        map(storage.getSnapshotById).
        map((snapshot) => { 
          var player = snapshot.players[p._id];
          return Object.assign({ 
            time: snapshot.time,
            event: storage.getEventById(snapshot._id).then(eventToGraph),
            gamesPlayed: player.singlesWon + player.singlesLost + player.doublesWon + player.doublesLost 
          }, player) 
        });
    }
  }, p);
}

function snapshotToGraph(snapshot) {
  return {
    _id: snapshot._id,
    time: snapshot.time,
    players: () => {
      return snapshot.players.map(mapIdToPlayer)
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