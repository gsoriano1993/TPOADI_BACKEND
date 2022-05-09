'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class paso extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  paso.init({
    idPaso: DataTypes.INTEGER,
    idReceta: DataTypes.INTEGER,
    nroPaso: DataTypes.INTEGER,
    texto: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'paso',
    tableName:'pasos'
  }, {
    freezeTableName: true
});
paso.removeAttribute('id');
  return paso;
};
