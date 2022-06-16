
const req = require('express/lib/request');
var nodemailer = require('nodemailer');
var randomExt = require('random-ext');
const mailCtrl = require('./mailCtrl');
const controllerValidador = require('/Users/gabrielsoriano/Documents/GitHub/TPOADI_BACKEND/controllers/controllerValidador');
var codigoReg = randomExt.integer(999999, 100000);
var validadorReg = require('../models').validador;
const varEmail = "gabrielsoriano39@gmail.com";//req.body.email;
const funcAux = require('../controllers/funciones');

module.exports = {
    create(req, res) {
        return validador
            .findAll({
                attributes: ['codigo'],
                //aca tengo que ir a buscar el codigo
                where: {
                    idUsuario: emailIng
                }
            }
            )
    }
}

/*
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
    }
}

*/