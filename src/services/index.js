const { authService } = require("./authentication");
const { kotakNeoService } = require("./kotak_neo");
const { redisService } = require("./redis");
const { socketService } = require("./socket_service");
const { kiteService } = require("./kite");

module.exports = {
  authService,
  kotakNeoService,
  redisService,
  socketService,
  kiteService,
};
