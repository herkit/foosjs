class FoosMemoryStore {
  constructor(options) {
    this._players = [];
  }

  storePlayers(players) 
  {
    this._players = players;
  }
}

module.exports = FoosMemoryStore;