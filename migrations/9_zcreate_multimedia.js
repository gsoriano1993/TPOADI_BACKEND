'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('multimedia', {
      idContenido: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idPaso: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
            model:"pasos",
            key:"idPaso" 
        }
      },
      tipo_contenido: {
        allowNull: true,
        type: Sequelize.STRING(10),
        validate: { is:["foto", "video", "audio"]}
      },
      extension: {
        allowNull: true,
        type: Sequelize.STRING(5)
      },
      urlContenido: {
        allowNull: true,
        type: Sequelize.STRING(300)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('multimedia');
  }
};