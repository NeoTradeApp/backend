const { authService } = require("./authentication");
const { kotakNeoService } = require("./kotak_neo");
const { redisService } = require("./redis");
const { niftyEvents, kotakNeoEvents } = require("./events");
const HSWebSocketService = require("./hs_web_socket_service");
const HSIWebSocketService = require("./hs_web_socket_service");

module.exports = {
  authService,
  kotakNeoService,
  redisService,
  niftyEvents,
  kotakNeoEvents,
  HSWebSocketService,
  HSIWebSocketService,
};
