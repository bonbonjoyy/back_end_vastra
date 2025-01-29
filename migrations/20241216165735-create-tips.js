'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tips', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      judul: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      kategori: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      deskripsi: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      urutan: {
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
    await queryInterface.dropTable('Tips');
  }
};