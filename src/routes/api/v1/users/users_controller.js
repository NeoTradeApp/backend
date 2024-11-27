const { BaseController, exportActions } = require("@api/base");
const { selectKeys } = require("@utils");
const { HSWebSocketService } = require("@services");

function UsersController(...args) {
  BaseController.call(this, ...args);

  this.profile = this.withTryCatch(async () => {
    const { sessionToken, sid } = this.user;

    new HSWebSocketService(sessionToken, sid).connect();

    return this.sendResponse(
      "Employee profile details",
      // selectKeys(this.user, "serverId", "sid")
      this.user
    );
  });
}

module.exports = exportActions(UsersController);
