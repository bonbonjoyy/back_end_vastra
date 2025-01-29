'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Menambahkan kolom baru ke tabel users
    await queryInterface.addColumn('users', 'hashed_recovery_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'recovery_code_created_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'recovery_code_used', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    // Menghapus kolom yang ditambahkan di bagian `up`
    await queryInterface.removeColumn('users', 'hashed_recovery_code');
    await queryInterface.removeColumn('users', 'recovery_code_created_at');
    await queryInterface.removeColumn('users', 'recovery_code_used');
  }
};
