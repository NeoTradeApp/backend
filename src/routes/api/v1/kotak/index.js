const express = require("express");
const { BaseRoute } = require("@api/base");
const KotakController = require("./kotak_controller");
const { authMiddleware } = require("../middlewares/authentication");

function KotakRoutes() {
  BaseRoute.call(this, express.Router());

  this.config = () => {
    this.get("/options-chain", authMiddleware, KotakController.getOptionsChain);

    return this.router;
  };
}

module.exports = KotakRoutes;
