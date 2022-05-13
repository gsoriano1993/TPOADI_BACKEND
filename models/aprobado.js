'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class aprobado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  aprobado.init({
    idAprobado: DataTypes.INTEGER,
    idReceta: DataTypes.INTEGER,
    flAprobado:DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'aprobado',
    tableName:'aprobados'
  }, {
    freezeTableName: true
});
aprobado.removeAttribute('id');
  return aprobado;
};

