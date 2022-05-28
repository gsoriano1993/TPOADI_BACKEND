'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class validador extends Model {
    static associate(models) {
    }
  }
  validador.init({
    idValidador: DataTypes.INTEGER,
    idUsuario: DataTypes.STRING,
    codigo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'validador',
    tableName:'validador'
  }, {
    freezeTableName: true
});
validador.removeAttribute('id');
  return validador;
};
