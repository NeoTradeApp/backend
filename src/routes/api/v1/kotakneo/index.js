const express = require("express");

const { BaseRoute } = require("@api/base");
const AuthRoutes = require("./auth");

function KotakNeoRoutes() {
  BaseRoute.call(this, express.Router());

  this.config = () => {
    this.use("/auth", new AuthRoutes().config());

    return this.router;
  };
}

module.exports = KotakNeoRoutes;
