'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class calificacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  calificacion.init({
    idCalificacion: DataTypes.INTEGER,
    idusuario: DataTypes.INTEGER,
    idReceta: DataTypes.INTEGER,
    calificacion: DataTypes.INTEGER,
    comentarios: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'calificacion',
    tableName:'calificaciones'
  }
  , {
    freezeTableName: true
});
calificacion.removeAttribute('id');
  return calificacion;
};


