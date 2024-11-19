const eventKeys = require("./eventKeys");
const redisKeys = require("./redisKeys");

module.exports = {
  ...eventKeys,
  ...redisKeys,
};
