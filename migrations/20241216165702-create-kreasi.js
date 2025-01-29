'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = {
  // Bagian Migration
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Kreasis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kulit: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      badan: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      image: {
        type: Sequelize.TEXT('long'),
        allowNull: true
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
    await queryInterface.dropTable('Kreasis');
  }
};
