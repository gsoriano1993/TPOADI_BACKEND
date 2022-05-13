'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('aprobados', {
      idAprobacion: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idReceta: {
        type: Sequelize.INTEGER,
        refereces:{
            model:"receta",
            key:"idReceta"
        }
      },
      flAprobado:{
          type: Sequelize.BOOLEAN
      }
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('aprobados');
  }
};

