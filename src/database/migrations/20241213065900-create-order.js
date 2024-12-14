'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      scrip: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tnxType: {
        type: Sequelize.ENUM("buy", "sell"),
        allowNull: false,
      },
      productType: {
        type: Sequelize.ENUM("MIS", "NRML"),
        allowNull: false,
        defaultValue: "MIS",
      },
      orderType: {
        type: Sequelize.ENUM("Limit", "Market", "SL-LMT", "SL-MKT"),
        allowNull: false,
        defaultValue: "Limit",
      },
      status: {
        type: Sequelize.ENUM("pending", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      providerUserId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      providerName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};
