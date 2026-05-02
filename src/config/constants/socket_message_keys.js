const MESSAGE_TYPE = {
  USER_SESSION: {
    EXPIRED: "USER_SESSION/EXPIRED",
  },
  MARKET_FEED: "MARKET_FEED",
  BACKTEST: {
    INITIATED: "BACKTEST/INITIATED",
    UPDATE: "BACKTEST/UPDATE",
  },
  POSITION: {
    UPDATE: (positionId) => `POSITION/UPDATE/${positionId}`,
  },
};

module.exports = {
  WEB_SOCKET: {
    MESSAGE_TYPE,
  },
};
