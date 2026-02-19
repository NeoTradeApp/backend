const express = require("express");
const { BaseRoute } = require("@api/base");
const KiteController = require("./kite_controller");
const { authMiddleware } = require("../middlewares/authentication");

function KiteRoutes() {
  BaseRoute.call(this, express.Router());

  this.config = () => {
    this.get("/login-url", KiteController.getLoginURL);
    this.post("/login", KiteController.login);

    // Protected routes
    this.get("/orders", authMiddleware, KiteController.getOrders);
    this.post("/orders", authMiddleware, KiteController.placeOrder);
    this.get("/options-chain", authMiddleware, KiteController.getOptionsChain);

    return this.router;
  };
}

module.exports = KiteRoutes;
