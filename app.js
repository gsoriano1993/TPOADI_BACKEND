const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
// This will be our application entry. We'll setup our server here.
const http = require('http');
const cors = require('cors');
const { sequelize } = require('./models');
const Sequelize = require('sequelize');
// Set up the express app
const app = express();
const upload = require('./multer')
const cloudinary = require('./cloudinary')
const fs = require('fs');
const logeo = require('./models').logeo;
const validador = require('./models').validador;
const bcrypt = require('bcryptjs');
const usuario = require('./models/usuario');
const mailController = require('./controllers/mailCtrl')

// Log requests to the console.
app.use(logger('dev'));
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({origin:'*'}));

///******************** CARGA DE IMAGENES *********************///
app.use('/upload-images', upload.array('image'), async (req, res) => {
     try {
          const uploader = async (path) => cloudinary.uploads(path, 'Images');
          if (req.method === 'POST') {
               const urls = []
               const files = req.files;
               for (const file of files) {
                    const { path } = file;
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
               }
               res.status(200).json({
                    message: 'images uploaded succesfully',
                    data: urls
               })
          } else {
               res.status(405).json({
                    err: `${req.method} method not allowed`
               })
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
})

///******************** REGISTRO *********************///
app.use('/signup', async (req, res) => {
     try {
          if (req.method === 'GET') {
               //valido si mail ya existe
               const resultadosMail = await logeo.findAll({
                    attributes: ['mail'],
                    raw: true,
                    where: {
                         mail: req.body.data.mail
                         //,contrasenia: bcrypt.hashSync(req.body.data.contrasenia, 10)
                    }
               });
               if (resultadosMail.length === 0) {
                    logeo.create({
                         mail: req.body.data.mail,
                         contrasenia: bcrypt.hashSync(req.body.data.contrasenia, 10)
                    })
                    res.status(200).json({
                         message: "usuario creado correctamente"
                    })
               } else {
                    res.status(200).json({
                         message: "mail en uso"
                    })
               }
               /////////valido si existe alias/nickname
               const resultadosAlias = await usuario.findAll({
                    attributes: ['nickname'],
                    raw: true,
                    where: {
                         mail: req.body.data.nickname
                    }
               });
               if (resultadosAlias.length === 0) {
                    usuario.create({
                         mail: req.body.data.mail,
                         nickname: req.body.data.nickname,
                         habilitado: -1,
                         nombre: null,
                         avatar: null,
                         tipo_usuario: "INVITADO"
                    })
                    res.status(200).json({
                         message: "usuario creado correctamente"
                    })
               } else {
                    res.status(200).json({
                         message: "error en la carga de datos en la BD"
                    })
               }
               /////////////// GENERA CODIGO Y ENVIA AL USUARIO
               var codigoReg = randomExt.integer(999999, 100000);
               var mailOptions = {
                    from: 'Recetips',
                    to: req.body.data.mail,
                    subject: 'Alta de usuario',
                    text: 'Hola! El valor que debés ingresar para finalizar el registro es ' + codigoReg
               };
               //envio el mail y cargo el codigo en la tabla
               transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                         res.status(500).send("error en el envio")
                    } else {
                         res.status(200).send("correo enviado")
                         validador.create({
                              mail: req.body.data.mail,
                              codigo: codigoReg
                         })
                         res.status(200).json({
                              message: "usuario creado correctamente"
                         })
                    }
               });
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
})

//valido si el codigo ingresado por el usuario es el mismo que el enviado en el mail
app.use('/validadorSignUp', async (req, res) => {
     try {
          validador.findAll()
          if (req.method === 'GET') {
               //valido si mail ya existe
               const resultadosCodigo = await logeo.findAll({
                    attributes: ['codigo'],
                    raw: true,
                    where: {
                         mail: req.body.data.mail
                    }
               })
               if (resultadosCodigo === req.body.data.codigo) {
                    res.status(200).json({
                         message: "Codigo OK usuario autenticado correctamente"
                    })
               } else {
                    res.status(200).json({
                         message: "Codigo erroneo"
                    })
               }
     
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});


///******************** LOGEO *********************///
//ver como el front maneja la casuistica del logeo (cambiar codigo 200 del status?)
app.use('/validarCredenciales', async (req, res) => {
     try {
          console.log(req.body.data.data.mail)
          if (req.method === 'POST') {
               const resultados = await logeo.findAll({
                    attributes: ['contrasenia'],
                    raw: true,
                    where: {
                         mail: req.body.data.data.mail
                         //,contrasenia: bcrypt.hashSync(req.body.data.contrasenia, 10)
                    }
               });

               if (resultados.length === 0) {
                    res.status(200).json({
                         message: "mail inexistente"
                    })
               } else {
                    bcrypt.compare(req.body.data.contrasenia, resultados[0].contrasenia, (error, result) => {
                         if (error) {
                              console.error('Error: ', error);
                         } else {
                              //console.log('Credenciales correctas?: ', result ) // true o false
                              if (result === true) {
                                   res.status(200).json({
                                        message: "credenciales ok, bienvenido"
                                   })
                              } else {
                                   res.status(200).json({
                                        message: "credenciales incorrectas"
                                   })
                              }
                         }
                    })
               }
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});

require('./routes')(app);
const port = process.env.PORT || 8000;
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
module.exports = app;

