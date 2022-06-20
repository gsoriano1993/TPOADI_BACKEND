'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  usuario.init({
    idUsuario: DataTypes.INTEGER,
    mail: DataTypes.STRING,
    nickname: DataTypes.STRING,
    habilitado: DataTypes.STRING,
    nombre: DataTypes.STRING,
    avatar: DataTypes.STRING,
    tipo_usuario: DataTypes.STRING
  },{
    sequelize,
    modelName: 'usuario',
    tableName:'usuarios'
  },{
    freezeTableName: true
});
/*usuario.hasMany(recetaModel);
recetaModel.belongsTo(usuario); */
usuario.removeAttribute('id');
return usuario;
};

