'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ingrediente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ingrediente.init({
    idIngrediente: DataTypes.INTEGER,
    nombre: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ingrediente',
  }, {
    freezeTableName: true
});
ingrediente.removeAttribute('id');
  return ingrediente;
};

