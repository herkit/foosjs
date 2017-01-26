"use strict";

var Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  FoosStore = require('../foosstore');

fs.readJSONAsync = function(filename) {
  return fs.readFileAsync(filename, 'utf8').then((data) => { return JSON.parse(data); });
}

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
      fs.
      readJSONAsync(self._options.storage_path + "players.json").
      then((players) => {
        self._setPlayers(players);
        return "loaded " + players.length + " players";
      }).
      catch((err) => { 
        self._setPlayers([]);
        return err.message;
      }),

      fs.
      readJSONAsync(self._options.storage_path + 'events.json').
      then((events) => {
        self._setEvents(events);
        return "loaded " + events.length + " events";
      }).
      catch((err) => { 
        self._setEvents([]); 
        return err.message;
      }),

      fs.readJSONAsync(self._options.storage_path + "snapshots.json").
      then((snapshots) => {
        self._setSnapshots(snapshots);
        return "loaded " + snapshots.length + " snapshots";
      }).
      catch((err) => { 
        self._setSnapshots([]); 
        return err.message;
      }),

      fs.
      readJSONAsync(self._options.storage_path + "playerevents.json").    
      then((playerevents) => {
        self._setPlayerEvents(playerevents);
        return "loaded playerevents";
      }).
      catch((err) => {
        self._setPlayerEvents({});
        return err.message;
      })
    ]).
    then((results) => {
      console.log(results);
    });
  }
}

module.exports = FoosFileStore;