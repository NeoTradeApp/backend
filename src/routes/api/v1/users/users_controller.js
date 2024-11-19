const { BaseController, exportActions } = require("@api/base");
const { selectKeys } = require("@utils");

function UsersController(...args) {
  BaseController.call(this, ...args);

  this.profile = this.withTryCatch(async () => {
    return this.sendResponse(
      "Employee profile details",
      selectKeys(this.user, "serverId", "sid")
    );
  });
}

module.exports = exportActions(UsersController);
