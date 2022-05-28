
const req = require('express/lib/request');
var nodemailer = require('nodemailer');
var randomExt = require('random-ext');
const mailCtrl = require('./mailCtrl');
const controllerValidador = require('./controllerValidador');
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


                })
    }
}

