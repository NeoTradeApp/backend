const WebSocket = require("ws");
const WebSocketServer = WebSocket.WebSocketServer;
const { logger } = require("winston");
const { authService } = require("./authentication");
const { appEvents } = require("@events");
const { EVENT } = require("@constants");

function SocketService() {
  this.clients = new Map();

  this.start = (server) => {
    this.socketServer = new WebSocketServer({ server });

    this.socketServer.on("connection", (ws, req) => {
      ws.on("error", this.errorHandler);

      authenticateUser(req, (error, client) => {
        if (error) {
          ws.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          ws.destroy();
          return;
        }

        const { userId } = client;
        this.clients.set(userId, ws);

        ws.on("message", async (rawData) => {
          const { type, data } = JSON.parse(rawData);
          appEvents.emit(EVENT.WEB_SOCKET.MESSAGE, userId, type, data);
        });

        ws.on("close", async () => {
          this.clients.delete(userId);
          logger.socket("Client disconnected", userId);
        });
      });
    });
  };

  const authenticateUser = (req, callback) => {
    try {
      const authToken = req.headers["auth-token"];
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

  this.send = (client, type, data) => {
    if (client && client.readyState === WebSocket.OPEN) {
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
    this.broadcast("MARKET_FEED", data)
  );

  appEvents.on(EVENT.APP.USER_SESSION_EXPIRED, (userId, type, data) => {
    const client = this.clients.get(userId);
    this.send(client, type, data);
  });
}

module.exports = { socketService: new SocketService() };
