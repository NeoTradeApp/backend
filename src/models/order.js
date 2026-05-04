"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  const parseDecimal = (field) => function () {
    const value = this.getDataValue(field);
    return value === null ? null : parseFloat(value);
  };

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      positionId: DataTypes.UUID,
      parentId: DataTypes.UUID,

      userId: DataTypes.STRING,
      orderId: DataTypes.STRING,

      name: DataTypes.STRING,
      symbol: DataTypes.STRING,

      type: DataTypes.STRING,
      scrip: DataTypes.STRING,
      exchange: DataTypes.STRING,

      tnxType: DataTypes.ENUM("BUY", "SELL"),
      status: DataTypes.STRING,

      quantity: DataTypes.INTEGER,
      filledQuantity: DataTypes.INTEGER,

      price: {
        type: DataTypes.DECIMAL,
        get: parseDecimal("price"),
      },
      brokerage: {
        type: DataTypes.DECIMAL,
        get: parseDecimal("brokerage"),
      },
      taxes: {
        type: DataTypes.DECIMAL,
        get: parseDecimal("taxes"),
      },

      productType: DataTypes.ENUM("MIS", "NRML"),
      orderType: DataTypes.ENUM("LIMIT", "MARKET", "SL-LMT", "SL-MKT"),
      status: DataTypes.ENUM(
        "OPEN",
        "FILLED",
        "PARTIAL",
        "CANCELLED",
        "REJECTED"
      ),

      serviceProviderUserId: DataTypes.STRING,
      serviceProviderName: DataTypes.STRING,

      remarks: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Order",
      underscored: true,
      timestamps: true,
    }
  );

  return Order;
};
