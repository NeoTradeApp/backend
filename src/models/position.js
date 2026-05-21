// models/position.js
const { Model, QueryTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Position extends Model {
    static associate(models) {
      Position.belongsTo(models.Strategy, {
        foreignKey: "strategyId",
        as: "strategy",
      });

      Position.hasMany(models.Order, {
        foreignKey: "positionId",
        as: "orders",
      });
    }

    static async groupedByDay(strategyId, fromDate, toDate) {
      return this.sequelize.query(`
        SELECT
          DATE(positions.created_at) AS date,
          sum(pnl) as pnl,
          strategies.strategy_name as "strategyName",
          json_agg(
            json_build_object(
              'id', positions.id,
              'name', positions.name,
              'strategyId', positions.strategy_id,
              'pnl', positions.pnl,
              'status', positions.status,
              'entryTime', positions.entry_time,
              'exitTime', positions.exit_time,
              'createdAt', positions.created_at,
              'orders', (
                SELECT json_agg(
                  json_build_object(
                    'id', orders.id,
                    'name', orders.name,
                    'price', orders.price,
                    'quantity', orders.quantity,
                    'tnxType', orders.tnx_type,
                    'brokerage', brokerage,
                    'taxes', taxes,
                    'parentId', parent_id,
                    'createdAt', orders.created_at
                  )
                  ORDER BY orders.created_at ASC
                )
                FROM orders
                WHERE orders.position_id = positions.id
              )
            )
            ORDER BY positions.created_at ASC
          ) AS positions
        FROM positions
        INNER JOIN strategies ON strategies.id = positions.strategy_id
        WHERE positions.strategy_id = :strategyId
          AND DATE(positions.created_at) BETWEEN :fromDate AND :toDate
        GROUP BY DATE(positions.created_at), strategies.strategy_name
        ORDER BY date ASC
      `,
        {
          replacements: {
            strategyId,
            fromDate,
            toDate,
          },

          type: QueryTypes.SELECT,
        }
      );
    }
  }

  const parseDecimal = (field) => function () {
    const value = this.getDataValue(field);
    return value === null ? null : parseFloat(value);
  };

  Position.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      strategyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      pnl: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
        get: parseDecimal("pnl"),
      },

      netPnl: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
        get: parseDecimal("netPnl"),
      },

      status: {
        type: DataTypes.ENUM("ACTIVE", "CLOSED", "CANCELLED"),
      },

      name: DataTypes.STRING,
      description: DataTypes.STRING,

      entryPrice: {
        type: DataTypes.DECIMAL(12, 2),
        get: parseDecimal("entryPrice"),
      },

      exitPrice: {
        type: DataTypes.DECIMAL(12, 2),
        get: parseDecimal("exitPrice"),
      },

      entryTime: DataTypes.DATE,
      exitTime: DataTypes.DATE,

      target: {
        type: DataTypes.DECIMAL(12, 2),
        get: parseDecimal("target"),
      },

      stoploss: {
        type: DataTypes.DECIMAL(12, 2),
        get: parseDecimal("stoploss"),
      },

      trailingStoploss: {
        type: DataTypes.DECIMAL(12, 2),
        get: parseDecimal("trailingStoploss"),
      },

      trailStoplossAt: {
        type: DataTypes.DECIMAL(12, 2),
        get: parseDecimal("trailStoplossAt"),
      },
    },
    {
      sequelize,
      modelName: "Position", // → positions
      underscored: true,
      timestamps: true,
    }
  );

  return Position;
};
