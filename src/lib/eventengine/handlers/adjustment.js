module.exports = function(ev) 
{
  this.increasePlayerProperty(ev.data.player, 'doublesWon', ev.data.dw_to - this._players[ev.data.player].doublesWon); 
  this.increasePlayerProperty(ev.data.player, 'doublesLost', ev.data.dl_to - this._players[ev.data.player].doublesLost);
  this.increasePlayerProperty(ev.data.player, 'singlesWon', ev.data.sw_to - this._players[ev.data.player].singlesWon);
  this.increasePlayerProperty(ev.data.player, 'singlesLost', ev.data.sl_to - this._players[ev.data.player].singlesLost);
  this.increasePlayerProperty(ev.data.player, 'rank', ev.data.points_to - this._players[ev.data.player].rank, ev._id);
}