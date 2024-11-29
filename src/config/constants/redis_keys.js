const KOTAK_NEO = {
  ACCESS_TOKEN: "REDIS/KOTAK_NEO/ACCESS_TOKEN",
};

const databaseIndex = 0;
const CHANNEL = {
  KEY_EXPIRY: `__keyevent@${databaseIndex}__:expired`,
  MARKET_FEED: "REDIS/CHANNEL/MARKET_FEED",
};

module.exports = {
  REDIS: {
    KOTAK_NEO,
    CHANNEL,
  },
};
