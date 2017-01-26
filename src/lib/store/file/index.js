"use strict";

var Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  FoosStore = require('../foosstore');


class FoosFileStore extends FoosStore {
  constructor(options) {
    super();
    var self = this;
    this._options = Object.assign({}, options);
    this._options.storage_path = this._options.storage_path || process.env.FOOS_STORAGE_PATH;
  }

  _writeEvents(callback) 
  {
    var self = this;
    self.getAllEvents().then((events) => {
      return fs.writeFileAsync(self._options.storage_path + "events.json", JSON.stringify(events, null, 2));
    })
  }

  _writeSnapshots() 
  {
    var self = this;
    self.getAllSnapshots().then((snapshots) => {
      return fs.writeFileAsync(
        self._options.storage_path + "snapshots.json", 
        JSON.stringify(snapshots, null, 2)
      );
    });
  }

  _writePlayers() 
  {
    var self = this;
    return fs.writeFileAsync(
      self._options.storage_path + "players.json", 
      JSON.stringify(self.getAllPlayers(), null, 2)
    );
  }

  _writePlayerEventLinks() 
  {
    var self = this;
    return self.
    getAllPlayerEvents().
    then((data) => { 
      return JSON.stringify(data, null, 2) 
    }).
    then((data) => { 
      return fs.writeFileAsync(self._options.storage_path + "playerevents.json", data);
    });
  }

  persist() 
  {
    return Promise.all([
      this._writePlayers(),
      this._writeEvents(),
      this._writeSnapshots(),
      this._writePlayerEventLinks()
    ])
    .then(() => {
      return true;
    })
    .catch((err) => { console.log("An error occurred while persisting", err); });
  }

  initialize() 
  {
    var self = this;
    return Promise.all([
      fs.readFileAsync(self._options.storage_path + "players.json", 'utf8'),
      fs.readFileAsync(self._options.storage_path + "events.json", 'utf8'),
      fs.readFileAsync(self._options.storage_path + "snapshots.json", 'utf8'),
      fs.readFileAsync(self._options.storage_path + "playerevents.json", 'utf8'),
    ])
    .map((data) => {
      return JSON.parse(data);
    })
    .spread((players, events, snapshots, playerevents) => {

      self._setPlayers(players);
      console.log("loaded", players.length, "players");
      self._setEvents(events);
      console.log("loaded", events.length, "events");
      self._setSnapshots(snapshots);
      console.log("loaded", snapshots.length, "snapshots");
      self._setPlayerEvents(playerevents);
      console.log("loaded playerevents");
    }).then(() => {
      console.log("FoosFileStore initialized");
    }).catch((err) => {
      console.log(err);
    });
  }
}

module.exports = FoosFileStore;