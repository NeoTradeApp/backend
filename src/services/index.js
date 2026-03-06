const { authService } = require("./authentication");
const { kotakNeoService } = require("./kotak_neo_service");
const { redisService } = require("./redis");
const { socketService } = require("./socket_service");
const { kiteService } = require("./kite_service");

module.exports = {
  authService,
  kotakNeoService,
  redisService,
  socketService,
  kiteService,
};
