const express = require("express");

const { BaseRoute } = require("@api/base");
const UsersRoutes = require("./users");
const BacktestRoutes = require("./backtest");
const KotakNeoRoutes = require("./kotakneo");

function V1Routes() {
  BaseRoute.call(this, express.Router());

  this.config = () => {
    this.use("/kotakneo", new KotakNeoRoutes().config());
    // this.use("/kite", new KiteRoutes().config());
    this.use("/users", new UsersRoutes().config());
    this.use("/backtest", new BacktestRoutes().config());

    return this.router;
  };
}

module.exports = V1Routes;
