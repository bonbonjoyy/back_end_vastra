//backend/models/kreasi.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Kreasi extends Model {}
  Kreasi.init(
    {
      kulit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      badan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Kreasi",
      timestamps: true,
    }
  );
  return Kreasi;
};

