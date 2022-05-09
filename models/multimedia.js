'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class multimedia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  multimedia.init({
    idContenido: DataTypes.INTEGER,
    idPaso: DataTypes.INTEGER,
    tipo_contenido: DataTypes.STRING,
    extension: DataTypes.STRING,
    urlContenido: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'multimedia',
  }, {
    freezeTableName: true
});
multimedia.removeAttribute('id');
  return multimedia;
};

