'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class foto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  foto.init({
    idfoto: DataTypes.INTEGER,
    idReceta: DataTypes.INTEGER,
    urlFoto: DataTypes.STRING,
    extension: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'foto',
  }, {
    freezeTableName: true
});
foto.removeAttribute('id');
  return foto;
};