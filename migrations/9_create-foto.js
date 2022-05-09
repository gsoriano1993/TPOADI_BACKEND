'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fotos', {
      idfoto: {
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
      urlFoto: {
        allowNull: true,
        type: Sequelize.STRING(300)
      },
      extension: {
        allowNull: true,
        type: Sequelize.STRING(5)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fotos');
  }
};