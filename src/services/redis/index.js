const redis = require("redis");
const { logger } = require("winston");
const { appEvents } = require("@events");
const { redisChannelListeners } = require("./channel_listeners");
const { REDIS, EVENT } = require("@constants");

function RedisService() {
  const url = "redis://redis:6379";

  this.cacheClient = redis.createClient({ url });
  this.subscriber = this.cacheClient.duplicate();
  this.publisher = this.cacheClient.duplicate();
  // this.publisher = redis.createClient({ url });

  this.cacheClient.on("error", (error) => {
    logger.error("Redis Error:", error);
  });

  this.connect = async () => {
    await this.cacheClient.connect();
    await this.publisher.connect();
    await this.subscriber.connect();

    await subscribeChannels();
    configEventListeners();
  };

  this.disconnect = async () => {
    await this.cacheClient.disconnect();
    await this.publisher.disconnect();

    await this.subscriber.unsubscribe();
    await this.subscriber.disconnect();

    removeEventListeners();
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

  this.publish = (channel, data) =>
    this.publisher.publish(channel, JSON.stringify(data));

  const configEventListeners = () => {
    appEvents.on(EVENT.HS_WEB_SOCKET.MARKET_FEED, (data) => {
      this.publish(REDIS.CHANNEL.MARKET_FEED, data);
    });
  };

  // const publishMarketData = (data) =>
  //   this.publish(REDIS.CHANNEL.MARKET_FEED, data);
  // const configEventListeners = () => {
  //   appEvents.on(EVENT.HS_WEB_SOCKET.MARKET_FEED, publishMarketData);
  // };
  // const removeEventListeners = () => {
  //   appEvents.removeListener(
  //     EVENT.HS_WEB_SOCKET.MARKET_FEED,
  //     publishMarketData
  //   );
  // };

  const subscribeChannels = async () => {
    await this.cacheClient.configSet("notify-keyspace-events", "Ex");

    const channels = [REDIS.CHANNEL.KEY_EXPIRY, REDIS.CHANNEL.MARKET_FEED];
    await Promise.all(
      channels.map(async (channel) => {
        await this.subscriber.subscribe(
          channel,
          redisChannelListeners[channel]
        );
      })
    );
  };
}

module.exports = { redisService: new RedisService() };
