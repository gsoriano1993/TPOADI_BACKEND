'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversiones', {
      idConversion: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idUnidadOrigen: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
            model:"unidades",
            key:"idUnidad"
        }
      },
      idUnidadDestino: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
            model:"unidades",
            key:"idUnidad"
        }
      },
      factorConversiones: {
        allowNull: true,
        type: Sequelize.FLOAT
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('conversiones');
  }
};
