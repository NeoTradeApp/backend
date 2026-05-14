const { Op } = require("sequelize");
const { Strategy, Position, Order } = require("@models");
const { BaseController, exportActions } = require("@api/base");
const { generateRandomId, startOfDay, endOfDay } = require("@utils");
const { redisService } = require("@services");
const { REDIS } = require("@constants");

const { SERVER_ID } = process.env;

function StrategiesController(...args) {
  BaseController.call(this, ...args);

  this.list = this.withTryCatch(async () => {
    const { date } = this.query;

    const strategies = await Strategy.findAll({
      where: { userId: this.user.userId },

      include: [
        {
          model: Position,
          as: "positions",

          where: {
            createdAt: {
              [Op.between]: [startOfDay(date).toDate(), endOfDay(date).toDate()],
            },
          },
          include: [{
            model: Order,
            as: "orders",
          }],
          required: false,
        },
      ],
    });

    this.sendResponse("List of strategies", strategies.map((_) => _.toJSON()));
  });

  this.executeStrategy = this.withTryCatch(async () => {
    const { strategyName } = this.params;
    const { userId } = this.user;

    const strategies = await Strategy.findOne({
      where: {
        strategyName,
        userId,
      },
    });

    const strategyId = generateRandomId(7);
    redisService.cache(
      REDIS.KEY.STRATEGY(strategyName, strategyId),
      () => ({
        userId,
        serverId: SERVER_ID,
        status: "started",
        params: this.body,
      })
    );

    this.sendResponse("Strategy started", { strategyName, strategyId });
  });
}

module.exports = exportActions(StrategiesController);
