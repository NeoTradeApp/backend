const { BaseController, exportActions } = require("@api/base");
const { kotakNeoService } = require("@services");
const { ApplicationError } = require("@error_handlers");

function KotakController(...args) {
  BaseController.call(this, ...args);

  this.getOptionsChain = this.withTryCatch(async () => {
    const { underlying, expiry } = this.query;
    if (!underlying) {
      throw new ApplicationError("Missing underlying symbol", 400);
    }

    // this.user comes from authMiddleware and contains Kotak session data
    const optionsChain = await kotakNeoService.getOptionsChain(underlying, expiry, this.user);
    this.sendResponse(optionsChain);
  });
}

module.exports = exportActions(KotakController);
