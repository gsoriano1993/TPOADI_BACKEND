'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class personalizado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  personalizado.init({
idpersonalizacion: DataTypes.INTEGER,
idReceta: DataTypes.INTEGER,
idUsuario: DataTypes.INTEGER,
factorConversion: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'personalizado',
    tableName:'recetasPersonalizadas'
  }, {
    freezeTableName: true
});
personalizado.removeAttribute('id');
  return personalizado;
};

