'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hapus kolom lama
    await queryInterface.removeColumn("Users", "hashed_recovery_code");
    await queryInterface.removeColumn("Users", "recovery_code_created_at");
    await queryInterface.removeColumn("Users", "recovery_code_used");

    // Tambahkan kolom baru
    await queryInterface.addColumn("Users", "resetPasswordLink", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "", // Default adalah string kosong
    });
  },

  async down (queryInterface, Sequelize) {
    // Kembalikan kolom lama
    await queryInterface.addColumn("Users", "hashed_recovery_code", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Users", "recovery_code_created_at", {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn("Users", "recovery_code_used", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // Hapus kolom baru
    await queryInterface.removeColumn("Users", "resetPasswordLink");
  }
};
