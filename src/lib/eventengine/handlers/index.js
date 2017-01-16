var handlers = function()
{
  this.singlematch = require("./singlematch");
  this.doublematch = require("./doublematch");
  this.adjustment = require("./adjustment");
  return this;
}

module.exports = handlers;