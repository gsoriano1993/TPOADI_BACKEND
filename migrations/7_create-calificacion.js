'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calificaciones', {
      idCalificacion: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idUsuario: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references:{
          model:'usuarios',
          key: 'idUsuario'
        }
      },
      idReceta: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references:{
          model:'recetas',
          key: 'idReceta'
        }
      },
      calificacion: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      comentarios: {
        allowNull: true,
        type: Sequelize.STRING(500)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('calificaciones');
  }
};



