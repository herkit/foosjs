var fs = require('fs'),
    xml2js = require('xml2js'),
    moment = require('moment'),
    shortid = require('shortid'),
    FoosEventEngine = require('./lib/eventengine');

var FoosStorage = require("./lib/store/" + (process.env.FOOS_STORAGE || "memory"));
var storage = new FoosStorage();

var parser = new xml2js.Parser();
var eventdefs =
[
  { type: "doublematch", rex: /(.+) and (.+) won a doubles match agains (.+) and (.+)\./i, properties: ['winner_1', 'winner_2', 'loser_1', 'loser_2'] },
  { type: "singlematch", rex: /(.+) won a singles match agains (.+)\./i, properties: ['winner_1', 'loser_1'] },
  { type: "adjustment", rex: /Manual adjustment of player (.+): SW: (\d+)->(\d+), SL: (\d+)->(\d+), DW: (\d+)->(\d+), DL: (\d+)->(\d+), Points: (\d+)->(\d+)/i, properties: ['player', 'sw_from', 'sw_to', 'sl_from', 'sl_to', 'dw_from', 'dw_to', 'dl_from', 'dl_to', 'points_from', 'points_to'] }
]

var playerPropertyNames = ['player', 'winner_1', 'winner_2', 'loser_1', 'loser_2'];

var importEvents = function(callback) {
  return function(err, data) 
  {
    parser.parseString(data, importEventsFromAudittrailXml(storage.getAllPlayers(), callback));
  }
}

var importEventsFromAudittrailXml = function(existingplayers, callback)
{ 
  return function (err, xml) 
  {
    var playerIdMap = {};
    existingplayers.forEach(function(player) {
      playerIdMap[player.name] = player._id;
    });

    var data = { players: [] };
    var eventSeqNo = 0;

    data.events = xml.audittrail.item.map(
      function(entry) {
        var when = entry.when,
            whenfloat = parseFloat(when.toString().replace(',', '.')),
            eventTime = moment.unix(whenfloat),
            what = entry.what.toString(),
            eventData = null;
        var eventType = "audittrail";
        for(var eventdefidx in eventdefs) {
          var eventdef = eventdefs[eventdefidx];
          var match = what.match(eventdef.rex);
          if (match) {
            eventData = {};
            eventType = eventdef.type;
            for(var propid in eventdef.properties) {
              var propertyName = eventdef.properties[propid];
              var value = match[parseInt(propid) + 1];
              // map any playername to id
              if (playerPropertyNames.indexOf(propertyName) > -1) {
                if (!playerIdMap[value]) {
                  console.log("Created new player", value);
                  var player = newPlayer(value);
                  data.players.push(player);
                  playerIdMap[value] = player._id;
                }
                value = playerIdMap[value];
              }
              eventData[propertyName] = value;
            }
            break;
          }
        }
        if (! eventData) eventData = what;

        eventSeqNo++;
        return {
          _id: shortid.generate(),
          seqNo: eventSeqNo,
          time: eventTime.toDate(),
          type: eventType,
          data: eventData,
          what: what
        }
      }
    )
    data.events.sort(byEventTime);
    callback(null, data);
  }
}

var importFile = function(filename, callback) 
{
  fs.readFile(filename, importEvents(callback));
}

var newPlayer = function(name) {
  var p = { _id: shortid.generate(), name: name}
  return p;
}

var byEventTime = function(a, b) 
{
  if (a.time < b.time) return -1;
  if (a.time > b.time) return 1;
  return 0;
};

console.log(process.env.FOOS_STORAGE);

storage
  .initialize()
  .then(() => {

var eventEngine = new FoosEventEngine(storage);

eventEngine.on("snapshot", function(snapshotId, players) {
  console.log("Snapshot created", snapshotId);
})

eventEngine.on("eventsapplied", (currentEvent) => {
  console.log("All events are applied, currently at event ", currentEvent);
});

eventEngine.on("playerstateschanged", (players) => {
  console.log("Players updated", players);
});

var storeCallback = (err) => {
  if (err) 
    console.log(err);
}

var storeEvents = function(err, data) {
  eventEngine.importData(data.players, data.events);
  eventEngine.applyEvents(
    () => { 
      storage.persist(
        (err) => { 
          if (err) console.log("Persist error: ", err); 
        }); 
    });

}

//importFile(__dirname + '/sampledata/audittrail.xml', storeEvents);

console.log("starting express");
var express = require('express'),
    app = express(),
    xmlparser = require('express-xml-bodyparser'),
    bodyParser = require('body-parser');

app.use(xmlparser());
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.get('/events', function(req, res) {
  res.send(storage.getAllEvents());
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
  storage.getSnapshotById(req.params.snapshotId, (err, snapshot) => {
    if (err)
      res.status(404).send({ error: err, params: req.params });
    else
      res.json(snapshot);
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
  importEventsFromAudittrailXml(storage.getAllPlayers(), function(err, events) {
    if (!err) {
      storeEvents(err, events);
      res.send({ "status": "ok", "event_count": events.length });
    } else {
      res.send({ "status": "failed", "error": err });
    }
  })(null, req.body);
})


app.post('/events', function(req, res) {
  storage
    .storeEvent(req.body)
    .then((ev) => {
      res.send(ev);
      eventEngine.applyEvents();
    });
})

app.listen(3000, function () {
  console.log('Foos.js is running on port 3000')
})
});


