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
    NEW: (strategyId) => `STRATEGY/${strategyId}/POSITION/NEW`,
    UPDATE: (strategyId, positionId) => `STRATEGY/${strategyId}/POSITION/${positionId}/UPDATE`,
  },
};

module.exports = {
  WEB_SOCKET: {
    MESSAGE_TYPE,
  },
};
