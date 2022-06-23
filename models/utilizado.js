'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class utilizado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  utilizado.init({
    idUtilizado: DataTypes.INTEGER,
    idReceta: DataTypes.INTEGER,
    idIngrediente: DataTypes.INTEGER,
    cantidad: DataTypes.INTEGER,
    idUnidad: DataTypes.INTEGER,
    observaciones: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'utilizado',
    tableName:'utilizados'
  }, {
    freezeTableName: true
});
utilizado.removeAttribute('id');
  return utilizado;
};
