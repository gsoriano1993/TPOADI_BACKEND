'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recetas', {
        idReceta: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idUsuario: {
        allowNull: true,
        type: Sequelize.INTEGER,
        refereces:{
            model:"usuarios",
            key:"idUsuario"
        }
      },
      nombre: {
        allowNull: true,
        type: Sequelize.STRING(500)
      },
      descripcion: {
        allowNull: true,
        type: Sequelize.STRING(1000)
      },
      foto: {
        allowNull: true,
        type: Sequelize.STRING(300)
      },
      porciones: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      cantidadPersonas: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      idTipo: {
        allowNull: true,
        type: Sequelize.INTEGER,
        refereces:{
            model:"tipos",
            key:"idTipo"
        }
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('recetas');
  }
};


