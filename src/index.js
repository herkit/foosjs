var fs = require('fs'),
    FoosEventEngine = require('./lib/eventengine');

var storage = require("./lib/store")

storage
  .initialize()
  .then(new Promise((resolve) => {
    eventEngine = new FoosEventEngine();

    eventEngine.on("snapshot", function(ev, players) {
      console.log("Snapshot created", ev.eventId, " affected players: ", ev.affectedPlayers);
    })

    eventEngine.on("eventsapplied", (currentEvent) => {
      console.log("All events are applied, currently at event ", currentEvent);
    });

    resolve();
  }))
  .then(() => {
    return require('./lib/web')(eventEngine);
  });