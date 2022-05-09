'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tipos', {
      idTipo: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      descripcion: {
        type: Sequelize.STRING(250)
      },
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tipos');
  }
};

