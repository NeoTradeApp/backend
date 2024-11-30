const { authService } = require("./authentication");
const { kotakNeoService } = require("./kotak_neo");
const { redisService } = require("./redis");
const { socketService } = require("./socket_service");
const { hsWebSocketService } = require("./hs_web_socket_service");
const HSIWebSocketService = require("./hs_web_socket_service");

module.exports = {
  authService,
  kotakNeoService,
  redisService,
  socketService,
  hsWebSocketService,
  HSIWebSocketService,
};
