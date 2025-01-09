const eventKeys = require("./event_keys");
const redisKeys = require("./redis_keys");
const socketMessageKeys = require("./socket_message_keys");

module.exports = {
  ...eventKeys,
  ...redisKeys,
  ...socketMessageKeys,
};
