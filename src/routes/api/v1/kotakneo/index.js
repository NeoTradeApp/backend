const express = require("express");

const { BaseRoute } = require("@api/base");
const AuthRoutes = require("./auth");
const MarketFeedRoutes = require("./market_feed");

function KotakNeoRoutes() {
  BaseRoute.call(this, express.Router());

  this.config = () => {
    this.use("/auth", new AuthRoutes().config());
    this.use("/market-feed", new MarketFeedRoutes().config());

    return this.router;
  };
}

module.exports = KotakNeoRoutes;
