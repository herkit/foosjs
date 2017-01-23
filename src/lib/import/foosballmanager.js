var xml2js = require('xml2js'),
    moment = require('moment'),
    shortid = require('shortid');


var playerPropertyNames = ['player', 'winner_1', 'winner_2', 'loser_1', 'loser_2'];
var eventdefs =
[
  { type: "doublematch", rex: /(.+) and (.+) won a doubles match agains (.+) and (.+)\./i, properties: ['winner_1', 'winner_2', 'loser_1', 'loser_2'] },
  { type: "singlematch", rex: /(.+) won a singles match agains (.+)\./i, properties: ['winner_1', 'loser_1'] },
  { type: "adjustment", rex: /Manual adjustment of player (.+): SW: (\d+)->(\d+), SL: (\d+)->(\d+), DW: (\d+)->(\d+), DL: (\d+)->(\d+), Points: (\d+)->(\d+)/i, properties: ['player', 'sw_from', 'sw_to', 'sl_from', 'sl_to', 'dw_from', 'dw_to', 'dl_from', 'dl_to', 'points_from', 'points_to'] }
]

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

module.exports = function(existingplayers, xml)
{ 
  return new Promise((resolve, reject) => {
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
    ).filter(function(entry) { return (entry.type != 'audittrail'); });
    
    data.events.sort(byEventTime);
    resolve(data);
  });
}
