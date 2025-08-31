const { BaseController, exportActions } = require("@api/base");
const { selectKeys } = require("@utils");

function BacktestController(...args) {
  BaseController.call(this, ...args);

  this.backtestStock = this.withTryCatch(async () => {
    this.sendResponse("Backtesting started");
  });
}

module.exports = exportActions(BacktestController);
