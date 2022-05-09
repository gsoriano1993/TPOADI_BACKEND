'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tipo.init({
    idTipo: DataTypes.INTEGER,
    descripcion: DataTypes.STRING
  }, 
  {
    sequelize,
    modelName: 'tipo',
    tableName:'tipos'
  }, {
    freezeTableName: true
});
tipo.removeAttribute('id');
  return tipo;
};

