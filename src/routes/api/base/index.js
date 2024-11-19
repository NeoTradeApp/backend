const BaseController = require("./base_controller");
const BaseRoute = require("./base_routes");

const exportActions = (klass) => {
  klass.action =
    (action) =>
    (...args) =>
      new klass(...args)[action]();

  return klass;
};

module.exports = {
  BaseController,
  exportActions,
  BaseRoute,
};
