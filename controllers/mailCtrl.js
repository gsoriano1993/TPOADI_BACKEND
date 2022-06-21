const req = require('express/lib/request');
var nodemailer = require('nodemailer');
var randomExt = require('random-ext');
const controllerUsuario = require('./controllerUsuario');
var codigoReg = randomExt.integer(999999, 100000);
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
            ciphers: 'SSLv3'
        },
        auth: {
            user: 'gabrielsoriano.-@hotmail.com',
            pass: 'Gabriel199325.'
        }
    });
   
  /////////////// GENERA CODIGO Y ENVIA AL USUARIO
  var codigoReg = randomExt.integer(999999, 100000);
  var mailOptions = {
       from: 'Recetips',
       to: req.body.data.mail,
       subject: 'Alta de usuario',
       text: 'Hola! El valor que debés ingresar para finalizar el registro es ' + codigoReg
  };
  transporter.sendMail(mailOptions, function (error, info) {
       if (error) {
            res.status(500).send("error en el envio")
       } else {
            validador.create({
                 mail: req.body.data.mail,
                 codigo: codigoReg
            })
            res.status(200).json({
                 message: "código creado correctamente"
            })
       }
  });




};



        