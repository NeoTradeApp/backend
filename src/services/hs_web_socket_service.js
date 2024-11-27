const { logger } = require("winston");
const { HSWebSocket } = require("@libs");
const { socketEvents } = require("./events");
const { HS_WEB_SOCKET_MESSAGE, SCRIPS } = require("@config/constants");

function HSWebSocketService(token, sid, chNo) {
  const url = "wss://mlhsm.kotaksecurities.com";

  this.channelNumber = chNo || 1;
  this.token = token;
  this.sid = sid;

  this.send = (obj) => this.userWS && this.userWS.send(JSON.stringify(obj));

  this.connect = () => {
    this.userWS = new HSWebSocket(url);

    this.userWS.onopen = () => {
      this.send({
        Authorization: this.token,
        Sid: this.sid,
        type: "cn",
      });

      logger.socket("HSWeb: connected");
      this.subscribeIndex(SCRIPS.NIFTY_50);
    };

    this.userWS.onclose = () => {
      logger.socket("HSWeb: disconnected");
    };

    this.userWS.onerror = (error) => {
      logger.error("HSWeb Error:", error);
    };

    this.userWS.onmessage = (msg) => {
      const result = JSON.parse(msg);
      logger.socket("HSWeb Message:", result);

      socketEvents.emit(HS_WEB_SOCKET_MESSAGE, result);
    };

    return this.userWS;
  };

  const subscribe = (type, scrips) =>
    this.send({
      type,
      scrips,
      channelnum: this.channelNumber,
    });
  this.subscribeIndex = (scrips) => subscribe("ifs", scrips);
  this.subscribeScrips = (scrips) => subscribe("mws", scrips);

  const pauseOrResume = (type) =>
    this.send({
      type,
      channelnums: [this.channelNumber],
    });
  this.pause = () => pauseOrResume("cp");
  this.resume = () => pauseOrResume("cr");
}

module.exports = HSWebSocketService;
