const { appEvents } = require("./events");
const { logger } = require("winston");

const {
  KOTAK_NEO_ACCESS_TOKEN,
  KOTAK_NEO_ACCESS_TOKEN_EXPIRED,
  APP_USER_ID_EXPIRED,
} = require("@config/constants");

module.exports = {
  [KOTAK_NEO_ACCESS_TOKEN]: (key) =>
    appEvents.emit(KOTAK_NEO_ACCESS_TOKEN_EXPIRED, key),

  [`^userId\/[\\w-]+$`]: (key) => {
    const [, userId] = key.split("/");
    return appEvents.emit(APP_USER_ID_EXPIRED, userId);
  },

  default: (key) => logger.warning("Redis: Unhandled event", key),
};
