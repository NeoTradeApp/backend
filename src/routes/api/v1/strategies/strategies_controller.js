const { Op } = require("sequelize");
const { Strategy, Position, Order } = require("@models");
const { BaseController, exportActions } = require("@api/base");
const { generateRandomId, startOfDay, endOfDay, todayTimeIst } = require("@utils");
const { redisService } = require("@services");
const { REDIS } = require("@constants");

const { SERVER_ID } = process.env;

function StrategiesController(...args) {
  BaseController.call(this, ...args);

  this.list = this.withTryCatch(async () => {
    const { date, includePositions } = this.query;

    const sqlQuery = { where: { userId: this.user.userId } };

    if (includePositions) {
      sqlQuery.include = [
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
      ];
    }

    const strategies = await Strategy.findAll(sqlQuery);

    this.sendResponse("List of strategies", strategies.map((_) => _.toJSON()));
  });

  this.pnlDayWise = this.withTryCatch(async () => {
    const { strategyId } = this.params;
    let { fromDate, toDate } = this.query;

    fromDate ||= todayTimeIst().startOf("month").format("YYYY-MM-DD");
    toDate ||= todayTimeIst().format("YYYY-MM-DD");

    const pnlDayWise = await Position.groupedByDay(strategyId, fromDate, toDate)

    this.sendResponse("P&L Day wise", pnlDayWise);
  });

  this.show = this.withTryCatch(async () => {
    const { date } = this.query;
    const { strategyId } = this.params;

    const strategy = await Strategy.findOne({
      where: { userId: this.user.userId, id: strategyId },

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

    if (!strategy) {
      return this.sendNotFound("Strategy not found");
    }

    this.sendResponse("Strategy details", strategy.toJSON());
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
