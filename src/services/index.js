const { authService } = require("./authentication");
const { kotakNeoService } = require("./kotak_neo");
const { redisService } = require("./redis");
const { socketService } = require("./socket_service");

module.exports = {
  authService,
  kotakNeoService,
  redisService,
  socketService,
};
