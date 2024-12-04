const JWT = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const { logger } = require("winston");
const BaseService = require("./base_service");
const { appEvents } = require("@events");
const { redisService } = require("./redis");
const { KotakNeoApiError } = require("@error_handlers");
const { REDIS, EVENT } = require("@constants");

const {
  KOTAK_NEO_CONSUMER_KEY,
  KOTAK_NEO_CONSUMER_SECRET,
  KOTAK_NEO_USERNAME,
  KOTAK_NEO_PASSWORD,
  KOTAK_NEO_NAPI_URL,
  KOTAK_NEO_GW_NAPI_URL,
} = process.env;

const A_DAY_IN_SECONDS = 86400;

function KotakNeoService() {
  BaseService.call(this);

  this.baseUrl = KOTAK_NEO_GW_NAPI_URL;

  this.errorHandler = (error, details = {}) => {
    const { status, data: { error: errorDetails } = {} } = error.response || {};
    const errorMessage =
      errorDetails && errorDetails.map((e) => e.message).join(". ");

    throw new KotakNeoApiError(errorMessage || error.message, status, details);
  };

  this.generateAccessToken = async () => {
    try {
      this.accessToken = await redisService.cache(
        REDIS.KOTAK_NEO.ACCESS_TOKEN,
        async () => {
          const consumerAuthToken = CryptoJS.enc.Base64.stringify(
            CryptoJS.enc.Utf8.parse(
              `${KOTAK_NEO_CONSUMER_KEY}:${KOTAK_NEO_CONSUMER_SECRET}`
            )
          );

          const body = {
            grant_type: "password",
            username: KOTAK_NEO_USERNAME,
            password: KOTAK_NEO_PASSWORD,
          };

          const response = await this.callApi("POST", "/oauth2/token", body, {
            headers: { Authorization: `Basic ${consumerAuthToken}` },
            baseUrl: KOTAK_NEO_NAPI_URL,
          });

          return response.access_token;
        },
        A_DAY_IN_SECONDS
      );

      this.defaultHeaders = { Authorization: `Bearer ${this.accessToken}` };
    } catch (error) {
      logger.error(error);
      setTimeout(
        () => appEvents.emit(EVENT.KOTAK_NEO.ACCESS_TOKEN_EXPIRED),
        3000
      );
    }
  };

  appEvents.on(EVENT.KOTAK_NEO.ACCESS_TOKEN_EXPIRED, this.generateAccessToken);

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
