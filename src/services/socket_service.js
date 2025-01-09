const WebSocket = require("ws");
const WebSocketServer = WebSocket.WebSocketServer;
const { logger } = require("winston");
const { authService } = require("./authentication");
const { appEvents } = require("@events");
const { EVENT, WEB_SOCKET } = require("@constants");

const HEALTHCHECK_INTERVAL = 30000;

function SocketService() {
  this.clients = new Map();

  this.start = (server) => {
    this.socketServer = new WebSocketServer({ server });

    this.socketServer.on("connection", (ws, req) => {
      ws.on("error", this.errorHandler);

      authenticateUser(req, (error, client) => {
        if (error) {
          ws.send("HTTP/1.1 401 Unauthorized\r\n\r\n");
          ws.terminate();
          return;
        }

        const { userId } = client;
        ws.isAlive = true;
        this.clients.set(userId, ws);
        logger.socket("Client connected", userId);

        ws.on("message", async (rawData) => {
          const { type, data } = JSON.parse(rawData);
          appEvents.emit(EVENT.WEB_SOCKET.MESSAGE, userId, type, data);
        });

        ws.on("close", async () => {
          this.clients.delete(userId);
          logger.socket("Client disconnected", userId);
        });

        ws.on("pong", () => (ws.isAlive = true));
      });
    });

    this.socketServer.on("close", () => {
      this.healthCheck && clearInterval(this.healthCheck);
    });

    this.healthCheck = setInterval(() => {
      this.socketServer &&
        this.clients.forEach((ws, userId) => {
          if (ws.isAlive === false) {
            this.clients.delete(userId);
            return ws.terminate();
          }

          ws.isAlive = false;
          ws.ping();
        });
    }, HEALTHCHECK_INTERVAL);
  };

  const authenticateUser = (req, callback) => {
    try {
      const cookie = req.headers.cookie || "";
      // const [, authToken] = cookie.match(/[^;]auth-token=([^;]+)/) || [];

      const cookies = cookie.split(";").map((_) => _.trim());
      const match =
        cookies.find((cookie) => /^auth-token=(.+)$/.test(cookie)) || "";
      const [, authToken] = match.split("=") || [];

      const userId = authService.verifyToken(authToken);

      callback(null, { userId });
    } catch (error) {
      callback(error);
    }
  };

  this.disconnect = () => {
    this.socketServer.close();
    this.socketServer.removeAllListeners();
  };

  this.isOpen = (client) => client && client.readyState === WebSocket.OPEN;
  this.send = (client, type, data) => {
    if (this.isOpen(client)) {
      client.send(JSON.stringify({ type, data }));
    }
  };

  this.broadcast = (type, data) => {
    this.socketServer &&
      this.clients.forEach((client) => this.send(client, type, data));
  };

  this.errorHandler = (error) => {
    logger.socket("Error:", error);
  };

  appEvents.on(EVENT.REDIS.MARKET_FEED, (data) =>
    this.broadcast(WEB_SOCKET.MESSAGE_TYPE.MARKET_FEED, data)
  );

  appEvents.on(EVENT.APP.USER_SESSION.EXPIRED, (userId) => {
    const client = this.clients.get(userId);
    this.send(client, type, data);
  });
}

module.exports = { socketService: new SocketService() };
