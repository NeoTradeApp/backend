const kotakNeoEvents = {
  KOTAK_NEO_ACCESS_TOKEN_EXPIRED: "KOTAK_NEO_ACCESS_TOKEN_EXPIRED",
  APP_USER_ID_EXPIRED: "APP_USER_ID_EXPIRED",
};

const marketEvents = {
  HS_WEB_SOCKET_MESSAGE: "HS_WEB_SOCKET_MESSAGE",
  HSI_WEB_SOCKET_MESSAGE: "HSI_WEB_SOCKET_MESSAGE",
};

const niftyEvents = {
  NIFTY_STOP_HIT: "NIFTY_STOP_HIT",
  NIFTY_TARGET_HIT: "NIFTY_TARGET_HIT",
};

module.exports = {
  ...kotakNeoEvents,
  ...marketEvents,
  ...niftyEvents,
};
