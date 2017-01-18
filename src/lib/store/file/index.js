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
    fs.writeFile(
      self._options.storage_path + "events.json", 
      JSON.stringify(self._events, null, 2),
      callback
    );
  }

  _writeSnapshots() 
  {
    var self = this;
    return fs.writeFileAsync(
      self._options.storage_path + "snapshots.json", 
      JSON.stringify(self._snapshots, null, 2)
    );    
  }

  _writePlayers() 
  {
    var self = this;
    return fs.writeFileAsync(
      self._options.storage_path + "players.json", 
      JSON.stringify(self._players, null, 2)
    );
  }

  _writePlayerEventLinks() 
  {
    var self = this;
    return fs.writeFileAsync(
      self._options.storage_path + "playerevents.json",
      JSON.stringify(self._playerEvents, null, 2)
    );
  }

  persist() 
  {
    return Promise.all([
      this._writePlayers(),
      this._writeEvents(),
      this._writeSnapshots(),
      this._writePlayerEventLinks()
    ]);
  }

  initialize() 
  {
    var self = this;
    return Promise.all([
      fs.readFileAsync(self._options.storage_path + "players.json", 'utf8'),
      fs.readFileAsync(self._options.storage_path + "events.json", 'utf8'),
      fs.readFileAsync(self._options.storage_path + "snapshots.json", 'utf8'),
      fs.readFileAsync(self._options.storage_path + "playerevents.json", 'utf8'),
    ]).spread((players, events, snapshots, playerevents) => {
      self._players = JSON.parse(players);
      self._events = JSON.parse(events);
      self._snapshots = JSON.parse(snapshots);
      self._playerEvents = JSON.parse(playerevents);
    }).then(() => {
      console.log("FoosFileStore initialized");
    });
  }
}

module.exports = FoosFileStore;