const kotakNeoEvents = {
  KOTAK_NEO_ACCESS_TOKEN_EXPIRED: "KOTAK_NEO_ACCESS_TOKEN_EXPIRED",
  APP_USER_ID_EXPIRED: "APP_USER_ID_EXPIRED",
};

const niftyEvents = {
  NIFTY_STOP_HIT: "NIFTY_STOP_HIT",
  NIFTY_TARGET_HIT: "NIFTY_TARGET_HIT",
};

module.exports = {
  ...kotakNeoEvents,
  ...niftyEvents,
};
