const { BaseController, exportActions } = require("@api/base");
const { kotakNeoService, authService, redisService } = require("@services");

const { AUTH_TOKEN_EXPIRES_IN_MINUTES } = process.env;
const TEN_MINUTES_IN_SECONDS = 600;

function AuthController(...args) {
  BaseController.call(this, ...args);

  this.login = this.withTryCatch(async () => {
    const { mobileNumber, password } = this.body;
    const { sid, viewToken } = await kotakNeoService.generateViewToken(
      mobileNumber,
      password
    );

    await kotakNeoService.generateOtp(viewToken);

    this.setCookies({ "view-token": viewToken, sid }, TEN_MINUTES_IN_SECONDS);

    this.sendResponse("OTP sent to the mobile number.");
  });

  this.validateOtp = this.withTryCatch(async () => {
    const { otp } = this.body;
    const { "view-token": viewToken, sid } = this.cookies;
    const { sessionToken, serverId, userId } =
      await kotakNeoService.getSessionToken(sid, viewToken, otp);

    redisService.set(
      `userId/${userId}`,
      {
        sessionToken,
        serverId,
        sid,
      },
      AUTH_TOKEN_EXPIRES_IN_MINUTES
    );

    const authToken = authService.signToken(userId);
    this.clearCookies(["view-token", "sid"]);
    this.setCookies({ "auth-token": authToken }, AUTH_TOKEN_EXPIRES_IN_MINUTES);

    this.sendResponse("Logged in successfully.");
  });

  this.logout = this.withTryCatch(async () => {});
}

module.exports = exportActions(AuthController);
