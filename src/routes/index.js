const express = require("express");

const { routesLoggerMiddleware } = require("./routes_logger_middleware");
const AuthRoutes= require("./auth_routes");
const ApiRoutes = require("./api");

function AppRoutes(app) {
  this.app = app;
  this.router = express.Router();

  this.config = () => {
    this.router
      .use("/healthcheck", (req, res) =>
        res.status(200).send("Server is up and running")
      )
      .use(routesLoggerMiddleware)
      .use("/auth", new AuthRoutes().config())
      .use("/api", new ApiRoutes().config());

    this.app.use("/", this.router);
  };
}

module.exports = AppRoutes;
