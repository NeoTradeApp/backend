const { BaseController, exportActions } = require("@api/base");
const {
  kotakNeoService,
  authService,
  redisService,
  hsWebSocketService,
} = require("@services");
const { ApplicationError } = require("@error_handlers");

const { AUTH_TOKEN_EXPIRES_IN_MINUTES } = process.env;
const TEN_MINUTES_IN_SECONDS = 600;

function AuthController(...args) {
  BaseController.call(this, ...args);

  this.login = this.withTryCatch(async () => {
    const { mobileNumber, password } = this.body;
    if (!mobileNumber || !password) {
      throw new ApplicationError(
        "Missing parameters mobileNumber or password",
        400
      );
    }

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

    const authToken = authService.signToken(userId);
    this.clearCookies(["view-token", "sid"]);
    this.setCookies({ "auth-token": authToken }, expiryTimeInSeconds);

    hsWebSocketService.connect(sessionToken, sid);

    this.sendResponse("Logged in successfully.");
  });

  this.logout = this.withTryCatch(async () => {
    this.clearCookies("auth-token");
    this.sendResponse("Logged out successfully");
  });
}

module.exports = exportActions(AuthController);
