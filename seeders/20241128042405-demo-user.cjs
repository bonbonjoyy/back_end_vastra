//C:\Users\Fadhlan\Downloads\Vastra-main\backend\seeders\20241128042405-demo-user.cjs

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Users", [
      {
        username: "admin",
        email: "admin@gmail.com",
        kata_sandi: "admin123",
        role: "admin",
        last_login: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "user",
        email: "user@gmail.com",
        kata_sandi: "user123",
        role: "user",
        last_login: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
