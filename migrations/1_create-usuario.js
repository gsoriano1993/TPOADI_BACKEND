'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      idUsuario: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mail: {
        allowNull:true,
        type: Sequelize.STRING(150),
        unique:true
      },
      nickname: {
        allowNull:false,
        type: Sequelize.STRING(100)
      },
      habilitado: {
        allowNull: true,
        type: Sequelize.STRING(2),
        //validate: { is:["Si", "No"]}
      },
      nombre: {
        allowNull: true,
        type: Sequelize.STRING(150)
      },
      avatar: {
        allowNull: false,
        type: Sequelize.STRING(300)
      },
      tipo_usuario: {
        allowNull: false,
        type: Sequelize.STRING(10),
        validate:{ is:['Alumno','Visitante']}
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};
