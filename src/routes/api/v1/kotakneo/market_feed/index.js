const express = require("express");
const { authMiddleware } = require("@api/v1/middlewares");
const { BaseRoute } = require("@api/base");
const MarketFeedController = require("./market_feed_controller");

function MarketFeedRoutes() {
  BaseRoute.call(this, express.Router());

  this.useMiddleware = authMiddleware;

  this.config = () => {
    this.get("/options-chain", MarketFeedController.action("getOptionsChain"));

    return this.router;
  };
}

module.exports = MarketFeedRoutes;
