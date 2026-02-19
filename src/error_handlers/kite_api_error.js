function KiteApiError(message, status, details = {}) {
  Error.call(this);
  this.message = message;
  this.status = status;
  this.details = details;
}

KiteApiError.prototype = Object.create(Error.prototype);
KiteApiError.prototype.constructor = KiteApiError;

module.exports = KiteApiError;
