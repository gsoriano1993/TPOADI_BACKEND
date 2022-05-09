'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class conversion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  conversion.init({
    idConversion: DataTypes.INTEGER,
    idUnidadOrigen: DataTypes.INTEGER,
    idUnidadDestino: DataTypes.INTEGER,
    factorConversiones: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'conversion',
    tableName:'conversiones'
  }, {
    freezeTableName: true
});
conversion.removeAttribute('id');
  return conversion;
};