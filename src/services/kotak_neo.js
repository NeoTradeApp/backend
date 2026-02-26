const JWT = require("jsonwebtoken");
const axios = require("axios");
const pako = require("pako");
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
    return { sessionToken: token, hsServerId, userId };
  };

  // Keep a reference to the original callApi from BaseService
  const baseCallApi = this.callApi;

  this.callApi = async (...args) => {
    const accessToken = await redisService.get(REDIS.KEY.KOTAK_NEO.ACCESS_TOKEN);
    if (!accessToken) {
      throw new KotakNeoApiError("Access token is not set", 401);
    }

    this.defaultHeaders = { Authorization: `Bearer ${accessToken}` };

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

  this.getInstruments = async (exchange) => {
    const cacheKey = `kotak_neo/master/${exchange}`;
    const cachedData = await redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    try {
      const response = await this.callApi("GET", `/master/1.0/get-master/${exchange}`);
      let instruments = [];
      if (response && response.path) {
        const fileResponse = await axios.get(response.path, { responseType: 'arraybuffer' });
        let data = fileResponse.data;
        if (response.path.endsWith('.gz')) {
          data = pako.ungzip(data, { to: 'string' });
        } else {
          data = data.toString();
        }

        instruments = this.parseMasterScrip(data, exchange);
      } else if (Array.isArray(response)) {
        instruments = response;
      }

      await redisService.set(cacheKey, JSON.stringify(instruments), 3600 * 24);
      return instruments;
    } catch (error) {
      console.error("Error fetching instruments:", error);
      return [];
    }
  };

  this.parseMasterScrip = (csvData, exchange) => {
    const lines = csvData.split(/\r?\n/);
    if (lines.length === 0) return [];

    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const instruments = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const ins = {};
      header.forEach((h, index) => {
        let val = cols[index] ? cols[index].trim() : '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        ins[h] = val;
      });
      instruments.push(this.mapInstrumentFields(ins, exchange));
    }
    return instruments;
  };

  this.mapInstrumentFields = (ins, exchange) => ({
    instrument_token: ins.pSymbol || ins.instrument_token || ins.tk,
    tradingsymbol: ins.pTrdSymbol || ins.trading_symbol || ins.ts,
    name: ins.pInstName || ins.name || ins.name,
    expiry: ins.pExpiryDate || ins.expiry,
    strike_price: ins.pStrikePrice || ins.strike_price,
    option_type: ins.pOptionType || ins.option_type,
    exchange_segment: exchange
  });

  this.getQuotes = async (instruments, sessionToken, sid) => {
    const body = {
      instruments: instruments.map(ins => ({
        instrument_token: ins.instrument_token,
        exchange_segment: ins.exchange_segment
      }))
    };

    const options = {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        sid: sid
      }
    };

    try {
      const response = await baseCallApi.call(this, "POST", "/quotes/1.0/quotes/v1/getQuote", body, options);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching quotes:", error);
      return [];
    }
  };

  this.getOptionsChain = async (underlying, expiry, userSession) => {
    const { sessionToken, sid } = userSession;
    const instruments = await this.getInstruments("nse_fo");

    const filtered = instruments.filter(ins =>
      ins.name === underlying &&
      (!expiry || ins.expiry === expiry) &&
      (ins.option_type === 'CE' || ins.option_type === 'PE')
    );

    if (filtered.length === 0) return [];

    const quotes = await this.getQuotes(filtered, sessionToken, sid);

    return filtered.map(ins => {
      const quote = quotes.find(q => q.tk === ins.instrument_token);
      return {
        ...ins,
        last_price: quote ? quote.ltp : null,
        change: quote ? quote.cng : null,
        oi: quote ? quote.oi : null
      };
    });
  };
}

module.exports = { kotakNeoService: new KotakNeoService() };
