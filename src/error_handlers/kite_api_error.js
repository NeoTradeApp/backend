class KiteApiError extends Error {
  constructor(message, status, details) {
    super(message);

    Object.assign(this, {
      name: "KiteApiError",
      message,
      status,
      details,
    });
  }
}

module.exports = KiteApiError;
