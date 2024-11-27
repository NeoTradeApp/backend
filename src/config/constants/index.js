const eventKeys = require("./eventKeys");
const redisKeys = require("./redisKeys");
const scrips = require("./scrips");

module.exports = {
  ...eventKeys,
  ...redisKeys,
  ...scrips,
};
