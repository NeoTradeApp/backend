const APP = {
  USER_SESSION_EXPIRED: "EVENT/APP/USER_SESSION_EXPIRED",
};

const REDIS = {
  MARKET_FEED: "EVENT/REDIS/MARKET_FEED",
};

const KOTAK_NEO = {
  ACCESS_TOKEN_EXPIRED: "EVENT/KOTAK_NEO/ACCESS_TOKEN_EXPIRED",
};

const HS_WEB_SOCKET = {
  MESSAGE: "EVENT/HS_WEB_SOCKET/MESSAGE",
  MARKET_FEED: "EVENT/HS_WEB_SOCKET/MARKET_FEED",
};

const HSI_WEB_SOCKET = {
  MESSAGE: "EVENT/HSI_WEB_SOCKET/MESSAGE",
};

const WEB_SOCKET = {
  MESSAGE: "EVENT/WEB_SOCKET/MESSAGE",
};

module.exports = {
  EVENT: {
    APP,
    REDIS,
    KOTAK_NEO,
    HS_WEB_SOCKET,
    HSI_WEB_SOCKET,
    WEB_SOCKET,
  },
};
