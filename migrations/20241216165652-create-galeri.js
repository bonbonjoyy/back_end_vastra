'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = {
  // Bagian Migration
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Galeris', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      kategori: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      sub_kategori: {
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
    await queryInterface.dropTable('Galeris');
  }
};