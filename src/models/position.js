// models/position.js
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Position extends Model {
    static associate(models) {
      Position.belongsTo(models.Strategy, {
        foreignKey: "strategyId",
      });

      Position.hasMany(models.Order, {
        foreignKey: "positionId",
      });
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
