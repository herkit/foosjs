var fs = require('fs'),
    FoosEventEngine = require('./lib/eventengine'),
    eventemitter = require('./lib/eventemitter');

var storage = require("./lib/store");

var socket = require("./lib/web/io");

storage
  .initialize()
  .then(() => {
    eventemitter.on("snapshot", function(ev, players) {
      socket.io.emit("snapshot", { event: ev, players: players });
      console.log("Snapshot created", ev.eventId, " affected players: ", ev.affectedPlayers);
    })
  })
  .then(() => {
    return new Promise((resolve) => {
      eventEngine = new FoosEventEngine();
      resolve();
    })
  })
  .then(() => {
    return require('./lib/web')(eventEngine);
  });