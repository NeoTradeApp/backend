const { logger } = require("winston");

const AN_HOUR_IN_SECONDS = 600;

function BaseController(req, res, next) {
  this.headers = req.headers;
  this.body = req.body;
  this.params = req.params;
  this.query = req.query;
  this.cookies = req.cookies;

  this.req = req;
  this.res = res;
  this.next = next;

  this.user = req.user;

  this.withTryCatch = (fn) => async () => {
    try {
      await fn();
    } catch (error) {
      this.errorHandler(error);
    }
  };

  this.permittedField = (params, ...fields) =>
    fields.reduce(
      (result, field) => ({ ...result, [field]: params[field] }),
      {}
    );

  this.sendResponse = (message, data = {}) =>
    this.res.status(200).send({
      message,
      data,
    });

  this.errorHandler = (error) => {
    const { status = 500, message, ...others } = error;

    this.res.status(status).send({
      ...others,
      message, // it's not an enumerable property of Error
    });

    if (status >= 500) {
      logger.error(error);
    }
  };

  this.setCookies = (cookies, expiryTime = AN_HOUR_IN_SECONDS) => {
    const maxAge = 1000 * expiryTime;
    const cookiesOptions = { maxAge, httpOnly: true };

    Object.entries(cookies).forEach(([key, value]) =>
      this.res.cookie(key, value, cookiesOptions)
    );
  };

  this.clearCookies = (keys) => {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }
    keys.forEach((key) => this.res.clearCookie(key));
  };
}

module.exports = BaseController;
