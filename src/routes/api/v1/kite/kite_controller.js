const { BaseController, exportActions } = require("@api/base");
const { kiteService, redisService, authService } = require("@services");
const { ApplicationError } = require("@error_handlers");
const { SERVICE_PROVIDERS } = require("@constants");

const { AUTH_TOKEN_EXPIRES_IN_MINUTES, SERVER_ID } = process.env;

function KiteController(...args) {
  BaseController.call(this, ...args);

  this.getLoginURL = this.withTryCatch(async () => {
    const loginURL = kiteService.getLoginURL();
    this.sendResponse({ loginURL });
  });

  this.login = this.withTryCatch(async () => {
    const { requestToken } = this.body;
    if (!requestToken) {
      throw new ApplicationError("Missing request token", 400);
    }

    const sessionData = await kiteService.generateSession(requestToken);
    const { access_token, user_id } = sessionData;

    const expiryTimeInSeconds = (AUTH_TOKEN_EXPIRES_IN_MINUTES || 600) * 60;

    // Store Kite specific session data in Redis
    await redisService.set(
      `userId/${user_id}`,
      {
        serverId: SERVER_ID,
        accessToken: access_token,
        serviceProvider: SERVICE_PROVIDERS.KITE,
      },
      expiryTimeInSeconds
    );

    const authToken = authService.signToken(user_id);
    this.setCookies({ "auth-token": authToken }, expiryTimeInSeconds);

    this.sendResponse({ message: "Logged in successfully with Zerodha", sessionData });
  });

  this.getOrders = this.withTryCatch(async () => {
    const { accessToken } = this.req.user;
    const orders = await kiteService.getOrders(accessToken);
    this.sendResponse(orders);
  });

  this.placeOrder = this.withTryCatch(async () => {
    const { accessToken } = this.req.user;
    const orderParams = this.body;
    const orderResponse = await kiteService.placeOrder(accessToken, orderParams);
    this.sendResponse(orderResponse);
  });

  this.getOptionsChain = this.withTryCatch(async () => {
    const { accessToken } = this.req.user;
    const { underlying, expiry } = this.query;
    if (!underlying) {
      throw new ApplicationError("Missing underlying symbol", 400);
    }

    const optionsChain = await kiteService.getOptionsChain(accessToken, underlying, expiry);
    this.sendResponse(optionsChain);
  });
}

module.exports = exportActions(KiteController);
