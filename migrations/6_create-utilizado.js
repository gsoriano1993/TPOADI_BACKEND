'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('utilizados', {
      idUtilizado: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idReceta: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
            model:"recetas",
            key:"idReceta"
        }
      },
      idIngrediente: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
            model:"ingredientes",
            key:"idIngrediente"
        }
      },
      cantidad: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      idUnidad: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
            model:"unidades",
            key:"idUnidad"
        }
      },
      observaciones: {
        allowNull: false,
        type: Sequelize.STRING(500)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('utlizados');
  }
};


