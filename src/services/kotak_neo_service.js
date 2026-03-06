const JWT = require("jsonwebtoken");
const BaseService = require("./base_service");
const { redisService } = require("./redis");
const { KotakNeoApiError } = require("@error_handlers");
const { REDIS } = require("@constants");
const { getErrorMessage } = require("@utils");

const { KOTAK_NEO_API_BASE_URL, KOTAK_NEO_ACCESS_TOKEN } = process.env;

function KotakNeoService() {
  BaseService.call(this);

  this.baseUrl = KOTAK_NEO_API_BASE_URL;

  this.errorHandler = (error, details = {}) => {
    const { status, data: errorObj } = error.response || {};
    // const errorMessage =
    //   errorDetails && errorDetails.map((e) => e.message).join(". ");
    const errorMessage = getErrorMessage(errorObj);

    throw new KotakNeoApiError(errorMessage || error.message, status, details);
  };

  this.generateViewToken = async (mobileNumber, ucc, totp) => {
    const body = { mobileNumber, ucc, totp };

    const { data } = await this.callApi(
      "POST",
      "/login/1.0/tradeApiLogin",
      body
    );

    const { sid, token } = data || {};
    return { sid, viewToken: token };
  };

  this.getSessionToken = async (sid, viewToken, mpin) => {
    const userId = this.getUserId(viewToken);

    const body = { mpin };
    const options = {
      headers: {
        sid,
        Auth: viewToken,
      },
    };

    const { data } = await this.callApi(
      "POST",
      "/login/1.0/tradeApiValidate",
      body,
      options
    );

    const { token, baseUrl } = data || {};
    return { sessionToken: token, baseUrl, userId };
  };

  // Keep a reference to the original callApi from BaseService
  const baseCallApi = this.callApi;

  this.callApi = async (...args) => {
    this.defaultHeaders = {
      Authorization: KOTAK_NEO_ACCESS_TOKEN,
      "neo-fin-key": "neotradeapi",
    };

    return await baseCallApi.apply(this, args);
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
