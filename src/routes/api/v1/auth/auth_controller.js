const { BaseController, exportActions } = require("@api/base");
const { kotakNeoService, authService, redisService } = require("@services");
const { ApplicationError } = require("@error_handlers");
const { validateLoginParams } = require("./validations");
const { REDIS } = require("@constants");

const { AUTH_TOKEN_EXPIRES_IN_MINUTES } = process.env;
const TEN_MINUTES_IN_SECONDS = 600;
const A_DAY_IN_SECONDS = 86400;

function AuthController(...args) {
  BaseController.call(this, ...args);

  this.login = this.withTryCatch(async () => {
    const { mobileNumber, password } = this.body;
    validateLoginParams({ mobileNumber, password });

    const { sid, viewToken } = await kotakNeoService.generateViewToken(
      mobileNumber,
      password
    );

    await kotakNeoService.generateOtp(viewToken);

    this.setCookies({ "view-token": viewToken, sid }, TEN_MINUTES_IN_SECONDS);

    this.sendResponse("OTP sent to the mobile number.");
  });

  this.validateOtpSession = this.withTryCatch(async () => {
    const { "view-token": viewToken } = this.cookies;
    if (!viewToken) {
      throw new ApplicationError("Invalid OTP session", 401);
    }

    kotakNeoService.getUserId(viewToken);
    this.sendResponse("Valid OTP session");
  });

  this.resendOtp = this.withTryCatch(async () => {
    const { "view-token": viewToken } = this.cookies;
    await kotakNeoService.generateOtp(viewToken);

    this.sendResponse("OTP resent to the mobile number.");
  });

  this.validateOtp = this.withTryCatch(async () => {
    const { otp } = this.body;
    if (!otp) {
      throw new ApplicationError("Missing otp", 400);
    }

    const { "view-token": viewToken, sid } = this.cookies;
    if (!viewToken || !sid) {
      throw new ApplicationError("Invalid session", 401);
    }

    const { sessionToken, serverId, userId } =
      await kotakNeoService.getSessionToken(sid, viewToken, otp);

    const expiryTimeInSeconds = AUTH_TOKEN_EXPIRES_IN_MINUTES * 60;
    redisService.set(
      `userId/${userId}`,
      {
        sessionToken,
        serverId,
        sid,
      },
      expiryTimeInSeconds
    );

    redisService.cache(
      REDIS.KEY.HS_WEB_SOCKET.CREDENTIALS,
      () => ({
        token: sessionToken,
        sid,
      }),
      A_DAY_IN_SECONDS
    );

    const authToken = authService.signToken(userId);
    this.clearCookies(["view-token", "sid"]);
    this.setCookies({ "auth-token": authToken }, expiryTimeInSeconds);

    this.sendResponse("Logged in successfully.");
  });

  this.logout = this.withTryCatch(async () => {
    this.clearCookies("auth-token");
    this.sendResponse("Logged out successfully");
  });
}

module.exports = exportActions(AuthController);
