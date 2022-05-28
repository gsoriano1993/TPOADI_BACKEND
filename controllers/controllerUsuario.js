const Sequelize = require('sequelize');
const usuario = require('../models').usuario;
module.exports = {
    create(req, res) {
        return usuario
            .create({
                idUsuario: req.params.idUsuario,
                mail: req.params.mail,
                nickname: req.params.nickname,
                habilitado: req.params.habilitado,
                nombre: req.params.nombre,
                avatar: req.params.avatar,
                tipo_usuario: req.params.tipo_usuario
            })
            .then(usuario => res.status(200).send(usuario))
            .catch(error => res.status(400).send(error))
    },
    list(_, res) {
        return usuario.findAll({})
            .then(usuario => res.status(200).send(usuario))
            .catch(error => res.status(400).send(error))
    },
    find(req, res) {
        return usuario.findAll({
            attributes: ['idUsuario'], 
            //aca tengo que ir a buscar el codigo
            where: {
                mail: req.params.mail,
            }
        })  
            .then (usuario => res.status(200).send(usuario))
            .catch(error => res.status(400).send(error))
    },

};


