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

  }

  storePlayer(player, callback) 
  {
    var self = this;
    super.storePlayer(player, (err) => {
      if (!err) {
        fs.writeFile(
          self._options.storage_path + "players.json", 
          JSON.stringify(self._players, null, 2), 
          callback
        );  
      } else {
        callback(err);
      }
    });
  }

  storeEvent(ev, callback) 
  {
    var self = this;
    super.storeEvent(ev, (err) => {
      if (!err) {
        fs.writeFile(
          this._options.storage_path + "events.json", 
          JSON.stringify(self._events, null, 2),
          callback
        );
      } else {
        callback(err);
      }
    });
    
  }

  storeSnapshot(snapshot, callback) 
  {
    var self = this;
    super.storeSnapshot(snapshot, (err) => {
      if (!err) {
        fs.writeFile(
          this._options.storage_path + "snapshots.json", 
          JSON.stringify(self._snapshots, null, 2),
          callback
        );
      } else {
        callback(err);
      }
    });
  }
}

module.exports = FoosFileStore;