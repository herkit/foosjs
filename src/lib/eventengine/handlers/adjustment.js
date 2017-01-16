module.exports = function(players, ev) 
{
  this.increasePlayerProperty(players, ev.data.player, 'doublesWon', ev.data.dw_to - players[ev.data.player].doublesWon); 
  this.increasePlayerProperty(players, ev.data.player, 'doublesLost', ev.data.dl_to - players[ev.data.player].doublesLost);
  this.increasePlayerProperty(players, ev.data.player, 'singlesWon', ev.data.sw_to - players[ev.data.player].singlesWon);
  this.increasePlayerProperty(players, ev.data.player, 'singlesLost', ev.data.sl_to - players[ev.data.player].singlesLost);
  this.increasePlayerProperty(players, ev.data.player, 'rank', ev.data.points_to - players[ev.data.player].rank, ev._id);
}