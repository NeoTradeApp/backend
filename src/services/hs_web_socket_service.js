const { logger } = require("winston");
const { HSWebSocket } = require("@libs");
const { appEvents } = require("@events");
const { EVENT, SCRIPS } = require("@constants");

function HSWebSocketService() {
  const url = "wss://mlhsm.kotaksecurities.com";

  this.channelNumber = 1;
  // this.token = token;
  // this.sid = sid;

  this.send = (obj) => this.isOpen() && this.userWS.send(JSON.stringify(obj));

  this.connect = (token, sid) => {
    /*
     * TODO: remove this condition.
     * Used as one socket connection for market feed from HS Web socket,
     * instead of adding separate socket for each user login.
     */
    if (this.userWS || this.isOpen()) {
      return;
    }

    this.userWS = new HSWebSocket(url);

    this.userWS.onopen = () => {
      this.send({
        Authorization: token,
        Sid: sid,
        type: "cn",
      });

      logger.socket("HSWeb: connected");
      this.subscribeIndex(SCRIPS.NIFTY_50);
    };

    this.userWS.onclose = () => {
      this.userWS = null;
      logger.socket("HSWeb: disconnected");
    };

    this.userWS.onerror = (error) => {
      logger.error("HSWeb Error:", error);
    };

    this.userWS.onmessage = (rawData) => {
      const data = JSON.parse(rawData);
      // logger.socket("HSWeb Message Received");

      const [{ e: exchange }] = data || [{}];
      if (exchange === "nse_cm") {
        appEvents.emit(EVENT.HS_WEB_SOCKET.MARKET_FEED, data);
      }
    };

    return this.userWS;
  };

  this.isOpen = () => this.userWS && this.userWS.OPEN && this.userWS.readyState;

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

module.exports = { hsWebSocketService: new HSWebSocketService() };
