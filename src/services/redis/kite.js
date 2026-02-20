const KiteConnect = require("kiteconnect").KiteConnect;
const BaseService = require("./base_service");

const { KITE_API_KEY, KITE_API_SECRET } = process.env;

function KiteService() {
  BaseService.call(this);

  const kite = new KiteConnect({ api_key: KITE_API_KEY });

  // Step 1: Get login URL
  console.log("Login URL:");
  console.log(kite.getLoginURL());
}

module.exports = { kiteService: new KiteService() };
