const { BaseController, exportActions } = require("@api/base");
const { generateRandomId } = require("@utils");
const { redisService } = require("@services");

const { SERVER_ID } = process.env;

function BacktestController(...args) {
  BaseController.call(this, ...args);

  this.backtestStock = this.withTryCatch(async () => {
    const { userId } = this.user;
    const backtestJobId = generateRandomId(7);
    redisService.cache(
      `backtest/${backtestJobId}`,
      () => ({
        userId,
        serverId: SERVER_ID,
        status: "started",
        params: this.body,
      }),
      "1h"
    );

    this.sendResponse("Backtesting started", { backtestJobId });
  });
}

module.exports = exportActions(BacktestController);
