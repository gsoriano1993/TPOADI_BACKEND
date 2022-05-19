'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class logeo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  logeo.init({
    idUsuario: DataTypes.INTEGER,
    mail: DataTypes.STRING,
    contrasenia: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'logeo',
    tableName:'logeo'
  }, {
    freezeTableName: true
});
logeo.removeAttribute('id');
  return logeo;
};

