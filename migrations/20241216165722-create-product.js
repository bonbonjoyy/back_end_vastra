'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_product: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      harga: {
        type: Sequelize.DECIMAL(10, 0),
        allowNull: true
      },
      stok: {
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      deskripsi: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      image: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      kategori: {
        type: Sequelize.STRING(50),
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
    await queryInterface.dropTable('Products');
  }
};