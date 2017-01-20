var Promise = require('bluebird'),
    express = require('express'),
    xmlparser = require('express-xml-bodyparser'),
    bodyParser = require('body-parser'),
    imports = require('../import'),
    storage = require('../store');


module.exports = function(eventEngine) {
  return new Promise((resolve, reject) => {
    var app = express();

    app.use(xmlparser());
    app.use(bodyParser.json());

    app.use(express.static(__dirname + '/public'));

    app.get('/events', function(req, res) {
      res.send(storage.getAllEvents());
    })
    app.get('/events/last/:count', function(req, res) {
      var events = storage.getAllEvents()
        .slice(0)
        .sort((a, b) => {
          if (a._seqNo < b._seqNo) return 1;
          if (a._seqNo > b._seqNo) return -1;
          return 0;
        }).slice(0, req.params.count);
        res.send(events);
    })

    app.get('/players', function(req, res) {
      res.send(storage.getAllPlayers());
    })

    app.get('/players/:playerId', function(req, res) {
      var resource = storage.getPlayerById(req.params.playerId);
      if (resource) {
        res.send(resource)
      } else {
        res.send(404, { error: "Player not found", params: req.params });
      }
    })

    app.get('/players/:playerId/events', function(req, res) {
      storage
        .getPlayerEvents(req.params.playerId)
        .then((events) => { 
          res.json(events); 
        })
        .catch((err) => { 
          res.status(404).send({ error: err }); 
        })
    })

    app.get('/snapshots', function(req, res) {
      storage.getAllSnapshots((err, snapshots) => {
        if (err)
          res.status(404).send({ error: err });
        else
          res.json(snapshots);
      })
    })

    app.get('/snapshots/:snapshotId', function(req, res) {
      storage.
        getSnapshotById(req.params.snapshotId).
        then((snapshot) => {
          res.send(snapshot);
        }).
        catch((err) => {
          res.status(404).send({ error: err, params: req.params });
        });         
    })

    app.get('/table', function(req, res) {
      var players = storage.getAllPlayers();
      storage.getLastSnapshot((err, snapshot) => {
        if (err)
          res.status(404).json(err);
        else {
          var table = players.map((player) => {
            return Object.assign({ _id: player._id, name: player.name}, snapshot.players[player._id]);
          }).map((player) => {
            player.gamesPlayed = player.singlesWon + player.singlesLost + player.doublesWon + player.doublesLost;
            return player;
          }).sort(function(a, b) {
            if (a.gamesPlayed < 10 && b.gamesPlayed > 10) return 1;
            if (a.gamesPlayed > 10 && b.gamesPlayed < 10) return -1;
            if (a.rank < b.rank) return 1;
            if (a.rank > b.rank) return -1;

            return 0;
          });
          res.json(table);
        }
      }); 
    })

    app.post('/import/foosballmanager', function (req, res) {
      console.log('importing');
      imports.
        foosballmanager(storage.getAllPlayers(), req.body).
        then((data) => {
          return eventEngine
            .importData(data.players, data.events);
        }).
        then(() => {
          res.send({ "status": "ok"});
        })/*.
        catch((err) => {
          res.status(500).send({ "status": "failed", "error": err });
        })*/
    })


    app.post('/events', function(req, res) {
      storage
        .storeEvent(req.body)
        .then((ev) => {
          res.send(ev);
          eventEngine.applyEvents();
        });
    })

    app.listen(3000, function (err) {
      if (err)
        reject(err);
      else
        resolve(app);
    })
  })
}