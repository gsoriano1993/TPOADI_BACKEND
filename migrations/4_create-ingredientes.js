'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ingredientes', {
      idIngrediente: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
          allowNull: true,
        type: Sequelize.STRING(200)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ingredientes');
  }
};


