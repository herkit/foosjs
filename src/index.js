var fs = require('fs'),
    xml2js = require('xml2js'),
    moment = require('moment'),
    shortid = require('shortid'),
    FoosEventEngine = require('./lib/eventengine');

var parser = new xml2js.Parser();
var eventdefs =
[
  { type: "doublematch", rex: /(.+) and (.+) won a doubles match agains (.+) and (.+)\./i, properties: ['winner_1', 'winner_2', 'loser_1', 'loser_2'] },
  { type: "singlematch", rex: /(.+) won a singles match agains (.+)\./i, properties: ['winner_1', 'loser_1'] },
  { type: "adjustment", rex: /Manual adjustment of player (.+): SW: (\d+)->(\d+), SL: (\d+)->(\d+), DW: (\d+)->(\d+), DL: (\d+)->(\d+), Points: (\d+)->(\d+)/i, properties: ['player', 'sw_from', 'sw_to', 'sl_from', 'sl_to', 'dw_from', 'dw_to', 'dl_from', 'dl_to', 'points_from', 'points_to'] }
]

var importEvents = function(callback) {
  return function(err, data) 
  {
    parser.parseString(data, importEventsFromAudittrailXml(callback));
  }
}

var importEventsFromAudittrailXml = function(callback)
{ 
  var playerPropertyNames = ['player', 'winner_1', 'winner_2', 'loser_1', 'loser_2'];

  return function (err, xml) 
  {
    var playerIdMap = {};
    var data = { players: {} };
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
                  data.players[player._id] = player;
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

var increasePlayerProperty = function(playerTable, player, property, increase, eventId) 
{
  playerTable[player][property] = (playerTable[player][property] || 0) + increase;
  /*if (typeof(eventId) === "string") {
    if (typeof(playerTable[player].events) === "undefined") playerTable[player].events = [];
    if (playerTable[player].events.indexOf(eventId) < 0) playerTable[player].events.push(eventId);
  }*/
}

var ensurePlayerExists = function(playerTable, player) {
  if (!playerTable[player]) playerTable[player] = { name: player, rank: 1200, doublesPlayed: 0, doublesWon: 0, doublesLost: 0, singlesPlayed: 0, singlesWon: 0, singlesLost: 0 };
}

var newPlayer = function(name) {
  var p = { _id: shortid.generate(), name: name, rank: 1200, doublesPlayed: 0, doublesWon: 0, doublesLost: 0, singlesPlayed: 0, singlesWon: 0, singlesLost: 0 }
  return p;
}

var byEventTime = function(a, b) 
{
  if (a.time < b.time) return -1;
  if (a.time > b.time) return 1;
  return 0;
};

var eventEngine = new FoosEventEngine();
eventEngine.on("snapshot", function(snapshotId, players) {
  console.log("Snapshot created", snapshotId);
})

var storeEvents = function(err, data) {
  eventEngine.loadData(data.players, data.events);
  eventEngine.applyEvents();
}

importFile(__dirname + '/sampledata/audittrail.xml', storeEvents);

var express = require('express'),
    app = express(),
    xmlparser = require('express-xml-bodyparser'),
    bodyParser = require('body-parser');

app.use(xmlparser());

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/events', function(req, res) {
  res.send(eventEngine._events);
})

app.get('/players', function(req, res) {
  res.send(eventEngine._players);
})

app.get('/players/:playerId', function(req, res) {
  var resource = eventEngine._players[req.params.playerId];
  if (resource) {
    res.send(resource)
  } else {
    res.send(404, { error: "Player not found", params: req.params });
  }
})

app.get('/players/:playerId/events', function(req, res) {
  var resource = eventEngine._playerEvents[req.params.playerId];
  if (resource) {
    res.send(resource)
  } else {
    res.send(404, { error: "Player events not found", params: req.params });
  }
})

app.get('/snapshots', function(req, res) {
  res.send(eventEngine.allSnapshots);
})

app.get('/snapshots/:snapshotId', function(req, res) {
  var snapshot = eventEngine.getSnapshot(req.params.snapshotId);
  if (snapshot)
    res.send(snapshot);
  else
    res.send(404, { error: "Snapshot not found", params: req.params });
})

app.get('/table', function(req, res) {
  res.send(eventEngine.playerTable);
})

app.post('/import/foosballmanager', function (req, res) {
  importEventsFromAudittrailXml(function(err, events) {
    if (!err) {
      storeEvents(err, events);
      res.send({ "status": "ok", "event_count": events.length });
    } else {
      res.send({ "status": "failed", "error": err });
    }
  })(null, req.body);
})


app.post('/events', function(req, res) {
  var result = eventEngine.addEvent(req.body);
  res.send(result);
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})