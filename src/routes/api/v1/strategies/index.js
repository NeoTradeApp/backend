const express = require("express");
const { authMiddleware } = require("@api/v1/middlewares");
const { BaseRoute } = require("@api/base");
const StrategiesController = require("./strategies_controller");

function StrategiesRoutes() {
  BaseRoute.call(this, express.Router());

  this.useMiddleware = authMiddleware;

  const parentConfig = this.config;
  this.config = () => {
    this.get("/", StrategiesController.action("list"));
    this.get("/:strategyId", StrategiesController.action("show"));
    this.get("/:strategyId/pnl-day-wise", StrategiesController.action("pnlDayWise"));
    this.post("/:strategyName", StrategiesController.action("executeStrategy"));

    return parentConfig();
  };
}

module.exports = StrategiesRoutes;
