const { logger } = require("winston");
const { appEvents } = require("@events");
const { EVENT, REDIS } = require("@constants");

const keyExpiryListenerMappings = {
  [`^userId\/[\\w-]+$`]: (key) => {
    const [, userId] = key.split("/");
    return appEvents.emit(EVENT.APP.USER_SESSION_EXPIRED, userId);
  },

  default: (key) => logger.warning("Redis: Unhandled key expiry event", key),
};

const keyExpiryListener = (key) => {
  const match = Object.keys(keyExpiryListenerMappings).find((_) => key.match(_));
  const listener = keyExpiryListenerMappings[match || "default"];
  return listener && listener(key);
};

const marketFeedListeners = (data) =>
  appEvents.emit(EVENT.REDIS.MARKET_FEED, JSON.parse(data));

// const keySetListeners = (key, value) => {};

module.exports = {
  redisChannelListeners: {
    [REDIS.CHANNEL.KEY_EXPIRY]: keyExpiryListener,
    [REDIS.CHANNEL.MARKET_FEED]: marketFeedListeners,
    // [REDIS.CHANNEL.KEY_SET]: keySetListeners,
  },
};
