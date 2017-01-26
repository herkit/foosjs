var Promise = require('bluebird'),
    xmlparser = require('express-xml-bodyparser'),
    bodyParser = require('body-parser'),
    imports = require('../import'),
    storage = require('../store'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('./io');

io.init(server);

module.exports = function(eventEngine) {
  return new Promise((resolve, reject) => {
    app.use(xmlparser());
    app.use(bodyParser.json());

    app.use(express.static(__dirname + '/public'));

    app.use('/graph', require('../graph'));

    app.get('/events', function(req, res) {
      storage.
      getAllEvents().
      then((events) => {
        res.send(events);  
      });
    })

    app.get('/events/last/:count', function(req, res) {
      storage.
      getAllEvents().
      then((events) => {
        res.send(events
          .slice(0)
          .sort((a, b) => {
            if (a._seqNo < b._seqNo) return 1;
            if (a._seqNo > b._seqNo) return -1;
            return 0;
          }).slice(0, req.params.count)
        )
      })
    })

    app.get('/players', function(req, res) {
      res.send(storage.getAllPlayers());
    })

    app.get('/players/:playerId', function(req, res) {
      storage.getPlayerById(req.params.playerId).then((resource) => {
        res.send(resource)
      }).
      catch((err) => {
        res.send(404, { error: "Player not found", params: req.params });
      });
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
      storage.
      getAllSnapshots().
      then((snapshots) => {
        res.json(snapshots);
      }).
      catch((err) => {
        res.status(404).send({ error: err });
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
      storage.
      getLastSnapshot().
      then((snapshot) => {
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
      }).
      catch((err) => {
        res.status(404).json(err);
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
        }).
        then(() => {
          eventEngine.applyEvents().then(() => { storage.persist().return(true); })
        }).
        catch((err) => {
          res.status(500).send({ "status": "failed", "error": err });
        })
    })


    app.post('/events', function(req, res) {
      storage
        .storeEvent(req.body)
        .then((ev) => {
          res.send(ev);
          eventEngine.applyEvents().return();
          return;
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    })

    server.listen(3000, function (err) {
      if (err)
        reject(err);
      else
        resolve(app);
    })
  })
}