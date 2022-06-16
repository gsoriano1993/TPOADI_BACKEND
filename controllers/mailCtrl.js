const req = require('express/lib/request');
var nodemailer = require('nodemailer');
var randomExt = require('random-ext');
const controllerUsuario = require('./controllerUsuario');
var codigoReg = 123765//randomExt.integer(999999, 100000);
//var validadorReg= require('../models').validador;
//const funcAux= require('../controllers/funciones');

// email sender function
exports.sendEmail = function (req, res) {
    // Definimos el transporter
    var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        port: 587, // port for secure SMTP
        secureConnection: false,
        tls: {
           ciphers:'SSLv3'
        },
        auth: {
            user: 'gabrielsoriano.-@hotmail.com',
            pass: 'Gabriel199325.'
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
         console.log(error);
         res.status(200)
        } else {
            console.log("Correo enviado");
        res.status(500)

        }
         /*   funcAux.cargarCodigo(req.body.mail, codigoReg);
            codigoReg = randomExt.integer(999999, 100000);
        }*/
    });
};