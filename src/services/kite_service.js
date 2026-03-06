const { KiteConnect } = require("kiteconnect");
const { KiteApiError } = require("@error_handlers");

const { KITE_API_KEY, KITE_API_SECRET } = process.env;

function KiteService() {
  this.getKiteInstance = (accessToken = null) => {
    return new KiteConnect({
      api_key: KITE_API_KEY,
      access_token: accessToken,
    });
  };

  this.getLoginURL = () => {
    const kc = this.getKiteInstance();
    return kc.getLoginURL();
  };

  this.generateSession = async (requestToken) => {
    const kc = this.getKiteInstance();
    try {
      const response = await kc.generateSession(requestToken, KITE_API_SECRET);
      return response;
    } catch (error) {
      throw new KiteApiError(error.message, 400, error);
    }
  };

  this.getOrders = async (accessToken) => {
    const kc = this.getKiteInstance(accessToken);
    try {
      return await kc.getOrders();
    } catch (error) {
      throw new KiteApiError(error.message, 400, error);
    }
  };

  this.placeOrder = async (accessToken, orderParams) => {
    const kc = this.getKiteInstance(accessToken);
    try {
      // orderParams should contain variety, exchange, tradingsymbol, transaction_type, quantity, etc.
      const { variety, ...params } = orderParams;
      return await kc.placeOrder(variety, params);
    } catch (error) {
      throw new KiteApiError(error.message, 400, error);
    }
  };

  this.getOptionsChain = async (accessToken, underlying, expiry) => {
    const kc = this.getKiteInstance(accessToken);
    try {
      // 1. Get instruments to find matching options
      const instruments = await kc.getInstruments("NFO");

      const filtered = instruments.filter(ins =>
        ins.name === underlying &&
        (!expiry || ins.expiry === expiry) &&
        ins.segment === "NFO-OPT"
      );

      if (filtered.length === 0) {
        return [];
      }

      // 2. Get quotes for filtered instruments
      // Kite getQuote can take up to 500 instruments
      const tradingsymbols = filtered.map(ins => `NFO:${ins.tradingsymbol}`);

      // We might need to chunk if there are many
      const quotes = await kc.getQuote(tradingsymbols);

      // 3. Map quotes back to instruments and format as option chain
      const optionChain = filtered.map(ins => {
        const quote = quotes[`NFO:${ins.tradingsymbol}`];
        return {
          ...ins,
          last_price: quote ? quote.last_price : null,
          change: quote ? quote.net_change : null,
          oi: quote ? quote.oi : null,
          volume: quote ? quote.volume : null,
        };
      });

      return optionChain;
    } catch (error) {
      throw new KiteApiError(error.message, 400, error);
    }
  };
}

module.exports = { kiteService: new KiteService() };
