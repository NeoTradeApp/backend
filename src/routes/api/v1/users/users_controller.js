const { BaseController, exportActions } = require("@api/base");
const { selectKeys } = require("@utils");

function UsersController(...args) {
  BaseController.call(this, ...args);

  this.profile = this.withTryCatch(async () => {
    const profile = selectKeys(this.user, "serverId", "sid", "userId");

    return this.sendResponse("Employee profile details", profile);
  });
}

module.exports = exportActions(UsersController);
