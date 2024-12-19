const redis = require("redis");
const { logger } = require("winston");
const { redisChannelListeners } = require("./channel_listeners");

const { REDIS_URL } = process.env;

function RedisService() {
  this.cacheClient = redis.createClient({ url: REDIS_URL });
  this.publisher = this.cacheClient.duplicate();
  this.subscriber = this.cacheClient.duplicate();

  this.cacheClient.on("error", (error) => {
    logger.error("Redis Error:", error);
  });

  this.connect = async () => {
    await this.cacheClient.connect();
    await this.publisher.connect();
    await this.subscriber.connect();

    await this.config();
    await subscribeChannels();
  };

  this.disconnect = async () => {
    await this.cacheClient.disconnect();
    await this.publisher.disconnect();

    await this.subscriber.unsubscribe();
    await this.subscriber.disconnect();
  };

  this.config = async () => {
    await this.cacheClient.configSet("notify-keyspace-events", "Ex");
  };

  this.get = async (cacheKey) => {
    const data = await this.cacheClient.get(cacheKey);
    return data && JSON.parse(data);
  };

  this.set = (cacheKey, data, expiryTime) =>
    this.cacheClient.set(cacheKey, JSON.stringify(data), {
      EX: expiryTime,
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

  const subscribeChannels = async () => {
    await Promise.all(
      Object.entries(redisChannelListeners).map(async ([channel, listener]) => {
        await this.subscriber.subscribe(channel, listener);
      })
    );
  };
}

module.exports = { redisService: new RedisService() };
