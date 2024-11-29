const { BaseController, exportActions } = require("@api/base");
const { appEvents } = require("@events");
const { EVENT, WEB_SOCKET } = require("@constants");
const { selectKeys } = require("@utils");

function UsersController(...args) {
  BaseController.call(this, ...args);

  this.profile = this.withTryCatch(async () => {
    const { userId } = this.user;
    const profile = selectKeys(this.user, "serverId", "sid", "userId");

    appEvents.emit(
      EVENT.APP.USER_SESSION_EXPIRED,
      userId,
      WEB_SOCKET.MESSAGE_TYPE.USER_SESSION_EXPIRED,
      profile
    );

    return this.sendResponse("Employee profile details", profile);
  });
}

module.exports = exportActions(UsersController);
