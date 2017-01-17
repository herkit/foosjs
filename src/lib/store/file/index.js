var fs = require('fs'),
  FoosStore = require('../foosstore');

class FoosFileStore extends FoosStore {
  constructor(options) {
    super();
    var self = this;

    this._options = Object.assign({}, options);
    this._options.storage_path = this._options.storage_path || process.env.FOOS_STORAGE_PATH;

    fs.readFile(this._options.storage_path + "players.json", 'utf8', function (err, data) {
      if (!err)
        self._players = JSON.parse(data);
    });

    fs.readFile(this._options.storage_path + "events.json", 'utf8', function (err, data) {
      if (!err)
        self._events = JSON.parse(data);
    });

    fs.readFile(this._options.storage_path + "snapshots.json", 'utf8', function (err, data) {
      if (!err)
        self._snapshots = JSON.parse(data);
    });

    fs.readFile(this._options.storage_path + "playerevents.json", 'utf8', function (err, data) {
      if (!err)
        self._playerEvents = JSON.parse(data);
    });

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

  _writeSnapshots(callback) 
  {
    var self = this;
    fs.writeFile(
      self._options.storage_path + "snapshots.json", 
      JSON.stringify(self._snapshots, null, 2),
      callback
    );    
  }

  _writePlayers(callback) 
  {
    var self = this;
    fs.writeFile(
      self._options.storage_path + "players.json", 
      JSON.stringify(self._players, null, 2), 
      callback
    );
  }

  _writePlayerEventLinks(callback) 
  {
    var self = this;
    fs.writeFile(
      self._options.storage_path + "playerevents.json",
      JSON.stringify(self._playerEvents, null, 2),
      callback
    );
  }

  persist(callback) 
  {
    this._writePlayers(() => {
      this._writeEvents(() => {
        this._writeSnapshots(() => {
          this._writePlayerEventLinks(callback);
        });     
      });  
    });
  }
}

module.exports = FoosFileStore;