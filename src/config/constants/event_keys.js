const APP = {
  USER_SESSION: {
    EXPIRED: "EVENT/APP/USER_SESSION/EXPIRED",
  },
};

const REDIS = {
  MARKET_FEED: "EVENT/REDIS/MARKET_FEED",
};

const WEB_SOCKET = {
  MESSAGE: "EVENT/WEB_SOCKET/MESSAGE",
};

module.exports = {
  EVENT: {
    APP,
    REDIS,
    WEB_SOCKET,
  },
};
