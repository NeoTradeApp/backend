const express = require("express");

const { BaseRoute } = require("@api/base");
const UsersRoutes = require("./users");
const BacktestRoutes = require("./backtest");
const KiteRoutes = require("./kite");
const KotakRoutes = require("./kotak");
const KotakNeoRoutes = require("./kotakneo");
const KiteRoutes = require("./kite");

function V1Routes() {
  BaseRoute.call(this, express.Router());

  this.config = () => {
    this.use("/kotakneo", new KotakNeoRoutes().config());
    this.use("/kite", new KiteRoutes().config());
    this.use("/users", new UsersRoutes().config());
    this.use("/backtest", new BacktestRoutes().config());
    this.use("/kite", new KiteRoutes().config());
    this.use("/kotak", new KotakRoutes().config());

    return this.router;
  };
}

module.exports = V1Routes;
