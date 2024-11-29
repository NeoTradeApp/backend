const EventEmitter = require("events");

class AppEvents extends EventEmitter {}

module.exports = { appEvents: new AppEvents() };
