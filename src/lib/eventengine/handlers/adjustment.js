module.exports = function(ev) 
{
  this.increasePlayerProperty(ev.data.player, 'doublesWon', function(current) { return ev.data.dw_to - current; }); 
  this.increasePlayerProperty(ev.data.player, 'doublesLost', function(current) { return ev.data.dl_to - current; });
  this.increasePlayerProperty(ev.data.player, 'singlesWon', function(current) { return ev.data.sw_to - current; });
  this.increasePlayerProperty(ev.data.player, 'singlesLost', function(current) { return ev.data.sl_to - current; });
  this.increasePlayerProperty(ev.data.player, 'rank', function(current) { return ev.data.points_to - current; });
}