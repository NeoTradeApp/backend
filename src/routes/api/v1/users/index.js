const express = require("express");
const { authMiddleware } = require("@api/v1/middlewares");
const { BaseRoute } = require("@api/base");
const UsersController = require("./users_controller");

function UsersRoutes() {
  BaseRoute.call(this, express.Router());

  this.useMiddleware = authMiddleware;

  const parentConfig = this.config;
  this.config = () => {
    this.get("/profile", UsersController.action("profile"));

    return parentConfig();
  };
}

module.exports = UsersRoutes;
