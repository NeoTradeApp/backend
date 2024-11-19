const { authService } = require("./authentication");
const { kotakNeoService } = require("./kotak_neo");
const { redisService } = require("./redis");
const { niftyEvents, kotakNeoEvents } = require("./events");

module.exports = {
  authService,
  kotakNeoService,
  redisService,
  niftyEvents,
  kotakNeoEvents,
};
