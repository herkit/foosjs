var FoosStorage = require("./" + (process.env.FOOS_STORAGE || "memory"));
var storage = new FoosStorage();

module.exports = storage;