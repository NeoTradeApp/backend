const { BaseController, exportActions } = require("@api/base");
const { kotakNeoService, authService, redisService } = require("@services");
const { ApplicationError } = require("@error_handlers");
const { validateLoginParams } = require("./validations");
const { REDIS, SERVICE_PROVIDERS } = require("@constants");

const { AUTH_TOKEN_EXPIRY_TIME, SERVER_ID } = process.env;

function AuthController(...args) {
  BaseController.call(this, ...args);

  this.login = this.withTryCatch(async () => {
    const { mobileNumber, ucc, totp } = this.body;
    validateLoginParams({ mobileNumber, ucc, totp });

    const { sid, viewToken } = await kotakNeoService.generateViewToken(
      mobileNumber,
      ucc,
      totp
    );

    this.setCookies({ "view-token": viewToken, sid }, "10m");

    this.sendResponse("TOTP is authenticated.");
  });

  this.validateMpinSession = this.withTryCatch(async () => {
    const { "view-token": viewToken } = this.cookies;
    if (!viewToken) {
      throw new ApplicationError("Invalid MPIN session", 401);
    }

    kotakNeoService.getUserId(viewToken);
    this.sendResponse("Valid MPIN session");
  });

  this.validateMpin = this.withTryCatch(async () => {
    const { mpin } = this.body;
    if (!mpin) {
      throw new ApplicationError("Missing MPIN", 400);
    }

    const { "view-token": viewToken, sid } = this.cookies;
    if (!viewToken || !sid) {
      throw new ApplicationError("Invalid session", 401);
    }

    const { sessionToken, baseUrl, userId } =
      await kotakNeoService.getSessionToken(sid, viewToken, mpin);

    const authTokenExpiryTime = AUTH_TOKEN_EXPIRY_TIME || "1h";

    redisService.set(
      `userId/${userId}`,
      {
        serverId: SERVER_ID,
        sessionToken,
        tradeApiBaseUrl: baseUrl,
        sid,
        serviceProvider: SERVICE_PROVIDERS.KOTAKNEO,
      },
      authTokenExpiryTime
    );

    redisService.cache(
      REDIS.KEY.HS_WEB_SOCKET.CREDENTIALS,
      () => ({
        token: sessionToken,
        sid,
      }),
      "1d"
    );

    const authToken = authService.signToken(userId);
    this.clearCookies(["view-token", "sid"]);
    this.setCookies({ "auth-token": authToken }, authTokenExpiryTime);

    this.sendResponse("Logged in successfully.");
  });

  this.logout = this.withTryCatch(async () => {
    this.clearCookies("auth-token");
    this.sendResponse("Logged out successfully");
  });
}

module.exports = exportActions(AuthController);
