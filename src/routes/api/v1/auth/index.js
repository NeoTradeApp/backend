const express = require("express");
const { BaseRoute } = require("@api/base");
const AuthController = require("./auth_controller");

function AuthRoutes() {
  BaseRoute.call(this, express.Router());

  this.useMiddleware = false;

  const parentConfig = this.config;
  this.config = () => {
    this.post("/login", AuthController.action("login"));
    this.post("/resend-otp", AuthController.action("resendOtp"));
    this.post("/validate-otp", AuthController.action("validateOtp"));
    this.post(
      "/validate-otp-session",
      AuthController.action("validateOtpSession")
    );
    this.post("/logout", AuthController.action("logout"));

    return parentConfig();
  };
}

module.exports = AuthRoutes;
