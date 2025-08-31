const express = require("express");
const { authMiddleware } = require("@api/v1/middlewares");
const { BaseRoute } = require("@api/base");
const BacktestController = require("./backtest_controller");

function BacktestRoutes() {
  BaseRoute.call(this, express.Router());

  this.useMiddleware = authMiddleware;

  const parentConfig = this.config;
  this.config = () => {
    this.post("/", BacktestController.action("backtestStock"));

    return parentConfig();
  };
}

module.exports = BacktestRoutes;
