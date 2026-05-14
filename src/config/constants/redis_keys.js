const { SERVER_ID } = process.env;

const KEY = {
  KOTAK_NEO: {
    ACCESS_TOKEN: "REDIS/KEY/KOTAK_NEO/ACCESS_TOKEN",
    MASTER_SCRIP: (exchange) => `REDIS/KEY/KOTAK_NEO/MASTER_SCRIP/${exchange}`,
    TRADE_BASE_URL: "REDIS/KEY/KOTAK_NEO/TRADE_BASE_URL",
  },
  HS_WEB_SOCKET: {
    CREDENTIALS: "REDIS/KEY/HS_WEB_SOCKET/CREDENTIALS",
  },
  USER_INFO: (userId) => `REDIS/KEY/USER_INFO/${userId}`,
  BACKTEST: (backtestJobId) => `REDIS/KEY/BACKTEST/${backtestJobId}`,
  STRATEGY: (strategyName, strategyId) => `REDIS/KEY/STRATEGY/${strategyName}/${strategyId}`,
};

const databaseIndex = 0;
const CHANNEL = {
  KEY_EXPIRY: `__keyevent@${databaseIndex}__:expired`,
  KEY_SET: `__keyevent@${databaseIndex}__:set`,
  MARKET_FEED: "REDIS/CHANNEL/MARKET_FEED",

  BACKTEST: `REDIS/CHANNEL/BACKTEST/${SERVER_ID}`,
  POSITION: {
    NEW: `REDIS/CHANNEL/POSITION/NEW/${SERVER_ID}`,
    UPDATE: `REDIS/CHANNEL/POSITION/UPDATE/${SERVER_ID}`,
  },
};

module.exports = {
  REDIS: {
    KEY,
    CHANNEL,
  },
};
