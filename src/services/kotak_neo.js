const JWT = require("jsonwebtoken");
const BaseService = require("./base_service");
const { redisService } = require("./redis");
const { KotakNeoApiError } = require("@error_handlers");
const { REDIS } = require("@constants");

const { KOTAK_NEO_GW_NAPI_URL } = process.env;

function KotakNeoService() {
  BaseService.call(this);

  this.baseUrl = KOTAK_NEO_GW_NAPI_URL;

  this.errorHandler = (error, details = {}) => {
    const { status, data: { error: errorDetails } = {} } = error.response || {};
    const errorMessage =
      errorDetails && errorDetails.map((e) => e.message).join(". ");

    throw new KotakNeoApiError(errorMessage || error.message, status, details);
  };

  this.generateViewToken = async (mobileNumber, password) => {
    const body = { mobileNumber, password };

    const { data } = await this.callApi(
      "POST",
      "/login/1.0/login/v2/validate",
      body
    );

    const { sid, token } = data || {};
    return { sid, viewToken: token };
  };

  this.generateOtp = (token) => {
    const userId = this.getUserId(token);

    this.callApi("POST", "/login/1.0/login/otp/generate", {
      userId,
      sendEmail: false,
      isWhitelisted: true,
    });

    return userId;
  };

  this.getSessionToken = async (sid, viewToken, otp) => {
    const userId = this.getUserId(viewToken);

    const body = { userId, otp };
    const options = {
      headers: {
        sid,
        Auth: viewToken,
      },
    };

    const { data } = await this.callApi(
      "POST",
      "/login/1.0/login/v2/validate",
      body,
      options
    );

    const { token, hsServerId } = data || {};
    return { sessionToken: token, serverId: hsServerId, userId };
  };

  // Overriding callApi function from BaseService.
  const parentCallApi = this.callApi;
  this.callApi = async (...args) => {
    const accessToken = await redisService.get(REDIS.KEY.KOTAK_NEO.ACCESS_TOKEN);
    if (!accessToken) {
      throw new KotakNeoApiError("Access token is not set", 401);
    }

    this.defaultHeaders = { Authorization: `Bearer ${accessToken}` };

    return await parentCallApi(...args);
  };

  this.getUserId = (viewToken) => {
    try {
      const data = JWT.decode(viewToken);
      return data.sub;
    } catch (error) {
      throw new KotakNeoApiError("Invalid view token", 401);
    }
  };
}

module.exports = { kotakNeoService: new KotakNeoService() };
