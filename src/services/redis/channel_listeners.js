const { logger } = require("winston");
const { appEvents } = require("@events");
const { EVENT, REDIS } = require("@constants");

const keyExpiryListenerMappings = {
  [REDIS.KEY.USER_INFO(`([\\w-_]+)$`)]: (keys) => {
    const [userId] = keys || [];
    return userId && appEvents.emit(EVENT.APP.USER_SESSION.EXPIRED, userId);
  },

  default: (key) => logger.warning("Redis: Unhandled key expiry event", key),
};

const unhandledKeyExpiryWarning = (key) => logger.warning("Redis: Unhandled key expiry event", key);
// const unhandledKeySetWarning = (key) => logger.warning("Redis: Unhandled key set event", key);

const keyListener = (listenerMappings, unhandledWarning) => (key) => {
  Object.entries(listenerMappings).forEach(([regex, handler]) => {
    const [firstMatch] = Array.from(key.matchAll(new RegExp(regex, "g")));
    if (!firstMatch) return unhandledWarning(key);

    const [patternIsMatching, ...keys] = firstMatch;
    if (patternIsMatching) {
      handler && handler(keys);
    } else {
      unhandledWarning(key);
    }
  });
};

const marketFeedListeners = (data) =>
  appEvents.emit(EVENT.REDIS.MARKET_FEED, JSON.parse(data));

// const keySetListeners = (key, value) => {};

const backtestMessageListener = (data) => {
  appEvents.emit(EVENT.REDIS.BACKTEST.UPDATE, JSON.parse(data));
};

const tradePositionUpdateListener = (data) => {
  appEvents.emit(EVENT.REDIS.POSITION.UPDATE, JSON.parse((data)));
};

module.exports = {
  redisChannelListeners: {
    [REDIS.CHANNEL.KEY_EXPIRY]: keyListener(keyExpiryListenerMappings, unhandledKeyExpiryWarning),
    [REDIS.CHANNEL.MARKET_FEED]: marketFeedListeners,
    // [REDIS.CHANNEL.KEY_SET]: keyListener,
    [REDIS.CHANNEL.BACKTEST]: backtestMessageListener,
    [REDIS.CHANNEL.POSITION_UPDATE]: tradePositionUpdateListener,
  },
};
