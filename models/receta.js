'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class receta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  receta.init({
    idReceta: DataTypes.INTEGER,
    idUsuario: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    foto: DataTypes.STRING,
    porciones: DataTypes.INTEGER,
    cantidadPersonas: DataTypes.INTEGER,
    idTipo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'receta',
  }, {
    freezeTableName: true
});
receta.removeAttribute('id');
  return receta;
};
