const redis = require("redis");
const { logger } = require("winston");
const { appEvents } = require("./events");
const {
  KOTAK_NEO_ACCESS_TOKEN,
  KOTAK_NEO_ACCESS_TOKEN_EXPIRED,
  APP_USER_ID_EXPIRED,
} = require("@config/constants");

const EIGHT_HOURS_IN_SECONDS = 28800;

function RedisService() {
  this.cacheClient = redis.createClient({
    url: "redis://redis:6379",
  });
  this.pubSubClient = this.cacheClient.duplicate();

  this.cacheClient.on("error", (error) => {
    logger.error("Redis Error:", error);
  });

  const databaseIndex = 0;
  const keyExpiryEventChannel = `__keyevent@${databaseIndex}__:expired`;

  this.connect = async () => {
    await this.cacheClient.connect();
    await this.cacheClient.configSet("notify-keyspace-events", "Ex");

    await this.pubSubClient.connect();
    await this.pubSubClient.subscribe(
      keyExpiryEventChannel,
      handleKeyExpiryEvent
    );
  };

  this.disconnect = async () => {
    await this.cacheClient.disconnect();

    await this.pubSubClient.unsubscribe(keyExpiryEventChannel);
    await this.pubSubClient.disconnect();
  };

  this.get = async (cacheKey) => {
    const data = await this.cacheClient.get(cacheKey);
    return data && JSON.parse(data);
  };

  this.set = (cacheKey, data, expiryTime) =>
    this.cacheClient.set(cacheKey, JSON.stringify(data), {
      EX: expiryTime,
      NX: true,
    });

  this.del = (cacheKey) => this.cacheClient.del(cacheKey);

  this.cache = async (cacheKey, callback, expiryTime) => {
    if (!this.cacheClient) {
      logger.error("Redis not connected");
      return await callback();
    }

    let data = await this.get(cacheKey);
    if (data) return data;

    data = await callback();
    await this.set(cacheKey, data, expiryTime);

    return data;
  };

  const handleKeyExpiryEvent = (key) => {
    switch (key) {
      case KOTAK_NEO_ACCESS_TOKEN:
        appEvents.emit(KOTAK_NEO_ACCESS_TOKEN_EXPIRED, key);
        break;

      default:
        if (key.startsWith("userId")) {
          const [, userId] = key.split("/");
          appEvents.emit(APP_USER_ID_EXPIRED, userId);
        }
        break;
    }
  };
}

module.exports = { redisService: new RedisService() };
