const express = require("express");

const { BaseRoute } = require("@api/base");
const AuthRoutes = require("./auth");
const UsersRoutes = require("./users");

function V1Routes() {
  BaseRoute.call(this, express.Router());

  this.config = () => {
    this.use("/auth", new AuthRoutes().config());
    this.use("/users", new UsersRoutes().config());

    return this.router;
  };
}

module.exports = V1Routes;
