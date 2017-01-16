var handlers = function()
{
  this.increasePlayerProperty = function(playerTable, player, property, increase, eventId) 
  {
    playerTable[player][property] = (playerTable[player][property] || 0) + increase;
    /*if (typeof(eventId) === "string") {
      if (typeof(playerTable[player].events) === "undefined") playerTable[player].events = [];
      if (playerTable[player].events.indexOf(eventId) < 0) playerTable[player].events.push(eventId);
    }*/
  };
  this.singlematch = require("./singlematch");
  this.doublematch = require("./doublematch");
  this.adjustment = require("./adjustment");
  return this;
}

module.exports = handlers;