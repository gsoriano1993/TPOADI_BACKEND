'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logeo', {
      idUsuario: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mail:{
        type: Sequelize.STRING(150),
       references: {
         model:"usuario",
         key:"mail"
       }
      },
      contrasenia: {
        type: Sequelize.STRING(250)
      },
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('logeo');
  }
};

