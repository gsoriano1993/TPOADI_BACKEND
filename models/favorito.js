'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class favorito extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  favorito.init({
    idFavorito: DataTypes.INTEGER,
    idReceta: DataTypes.INTEGER,
    idUsuario: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'favorito',
    tableName:'favoritos'
  }, {
    freezeTableName: true
});
favorito.removeAttribute('id');
  return favorito;
};
