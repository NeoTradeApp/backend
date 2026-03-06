const express = require("express");
const { BaseRoute, BaseController, exportActions } = require("@api/base");

function AuthRoutes() {
  BaseRoute.call(this, express.Router());

  this.config = () => {
    this.post("/logout", AuthController.action("logout"))

    return this.router;
  };
}

const AuthController = exportActions(function (...args) {
  BaseController.call(this, ...args);

  this.logout = this.withTryCatch(async () => {
    this.clearCookies("auth-token");
    this.sendResponse("Logged out successfully");
  });
});

module.exports = AuthRoutes;
