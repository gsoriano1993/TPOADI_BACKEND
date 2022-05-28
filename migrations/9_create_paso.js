'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pasos', {
      idPaso: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idReceta: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references:{
            model:"recetas",
            key:"idReceta"
        }
      },
      nroPaso: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      texto: {
        allowNull: true,
        type: Sequelize.STRING(2000)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pasos');
  }
};
