const req = require('express/lib/request');
var nodemailer = require('nodemailer');
var randomExt = require('random-ext');
const controllerUsuario = require('./controllerUsuario');
var codigoReg = 123765//randomExt.integer(999999, 100000);
var validadorReg= require('../models').validador;
const funcAux= require('../controllers/funciones');

// email sender function
exports.sendEmail = function (req, res) {
    // Definimos el transporter
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'soportebyrecetips@gmail.com',
            pass: 'Claudiogodio69'
        }
    });
    // Definimos el email
    var mailOptions = {
        from: 'Recetips',
        to: req.body.mail,
        subject: 'Alta de usuario',
        text: 'Hola! El valor que debés ingresar para finalizar el registro es ' + codigoReg
    };
    // Enviamos el email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          //  console.log(error);
            res.send(500, err.message);
        } else {
            console.log("Correo enviado");
            res.status(200).jsonp(req.body);
            funcAux.cargarCodigo(req.body.mail, codigoReg);
            codigoReg = randomExt.integer(999999, 100000);
        }
    });
};