const { BaseController, exportActions } = require("@api/base");
const { redisService, kotakNeoService } = require("@services");
const { ApplicationError } = require("@error_handlers");
const { REDIS } = require("@constants");

function MarketFeedController(...args) {
  BaseController.call(this, ...args);

  this.getOptionsChain = this.withTryCatch(async () => {
    const { exchange, ...filter } = this.query;

    const instruments = await redisService.get(REDIS.KEY.KOTAK_NEO.MASTER_SCRIP(exchange)) || [];
    // const optionsChain = await kotakNeoService.getOptionsChain(underlying, expiry, this.user);
    this.sendResponse(
      "List of instruments",
      instruments.filter((ins) => Object.entries(filter).every(([key, value]) => !value || ins[key]?.includes(value)))
    );
  });
}

module.exports = exportActions(MarketFeedController);
