const EventEmitter = require("events");
const { NIFTY_STOP, NIFTY_TARGET } = require("@config/constants");

class AppEvents extends EventEmitter {}

class SocketEvents extends EventEmitter {}

class MarketEvents extends EventEmitter {}

module.exports = {
  appEvents: new AppEvents(),
  marketEvents: new MarketEvents(),
  socketEvents: new SocketEvents(),
};
