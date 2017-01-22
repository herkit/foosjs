module.exports = {
  io: function() {},
  init: function(server) {
    this.io = require("socket.io")(server);
  }
};