const req = require('express/lib/request');
var nodemailer = require('nodemailer');
var randomExt = require('random-ext');
const controllerUsuario = require('./controllerUsuario');
var validadorReg = require('../models').validador;
const controllerMail = require('./mailCtrl');

module.exports = {
    //req.body.email;
    cargarCodigo(varEmail, codigoReg) {
        validadorReg.create({
            //idUsuario: 123,
            idUsuario: varEmail,  //aca tiene que ir el mail del registro
            codigo: codigoReg
        })
        const codIngresado = 123456;//aca me tienen que pasar del front el codigo que ingresa el usuario
        //controllerUsuario.find(where:{email:{$in:{req.body.email}}) //busco el mail

    },
    validarCodigo(emailIng, codIngresado){
        var codigoGenerado=validadorReg.find({
            attributes: ['codigo'], 
            //aca tengo que ir a buscar el codigo
            where: {
                idUsuario: emailIng,
        }})
        if (codigoGenerado == codIngresado) {
            console.log("OK");
            res.status(200);
        } else {
            console.log("El codigo ingresado es incorrecto");
            res.send(500);
        }
    }
}
