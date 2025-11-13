const { SERVER_ID } = process.env;

const KEY = {
  KOTAK_NEO: {
    ACCESS_TOKEN: "REDIS/KEY/KOTAK_NEO/ACCESS_TOKEN",
  },
  HS_WEB_SOCKET: {
    CREDENTIALS: "REDIS/KEY/HS_WEB_SOCKET/CREDENTIALS",
  },
};

const databaseIndex = 0;
const CHANNEL = {
  KEY_EXPIRY: `__keyevent@${databaseIndex}__:expired`,
  KEY_SET: `__keyevent@${databaseIndex}__:set`,
  MARKET_FEED: "REDIS/CHANNEL/MARKET_FEED",

  BACKTEST: `REDIS/CHANNEL/BACKTEST/${SERVER_ID}`,
};

module.exports = {
  REDIS: {
    KEY,
    CHANNEL,
  },
};
