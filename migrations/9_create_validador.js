'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('validador', {
      idValidador: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mail: {
        allowNull: false,
        type: Sequelize.STRING(250),
        /*references:{
            model:"usuarios",
            key:"idUsuario"
        }*/
      },
      codigo: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('validador');
  }
};
