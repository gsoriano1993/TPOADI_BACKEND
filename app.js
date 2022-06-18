const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
// This will be our application entry. We'll setup our server here.
const http = require('http');
const { sequelize } = require('./models');
const Sequelize = require('sequelize');
// Set up the express app
const app = express();
const upload = require('./multer')
const cloudinary = require('./cloudinary')
const fs = require('fs');
const logeo = require('./models').logeo;
const bcrypt = require('bcryptjs');


// Log requests to the console.
app.use(logger('dev'));
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));




//carga de imagenes
app.use('/upload-images', upload.array('image'), async (req, res) => {
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
})

//crear usurio

app.use('/validarCredenciales', async (req, res) => {
     //valido si mail ya existe
     if (req.method === 'GET') {
          const resultadosMail = await logeo.findAll({
               attributes: ['mail'],
               raw: true,
               where: {
                    mail: req.body.mail
                    //,contrasenia: bcrypt.hashSync(req.body.contrasenia, 10)
               }
          });
          if (resultadosMail.length === 0) {
               res.status(200).json({
                    message: "mail en uso"
               })
          } else {
               logeo.create({
                    mail: req.body.mail,
                    contrasenia: bcrypt.hashSync(req.body.contrasenia, 10)
               })
               res.status(200).json({
                    message: "usuario creado correctamente"
               })
          }

     }






          //ver como el front maneja la casuistica del logeo (cambiar codigo 200 del status?)
          app.use('/validarCredenciales', async (req, res) => {
               if (req.method === 'GET') {
                    const resultados = await logeo.findAll({
                         attributes: ['contrasenia'],
                         raw: true,
                         where: {
                              mail: req.body.mail
                              //,contrasenia: bcrypt.hashSync(req.body.contrasenia, 10)
                         }
                    });

                    if (resultados.length === 0) {
                         res.status(200).json({
                              message: "mail inexistente"
                         })
                    } else {
                         bcrypt.compare(req.body.contrasenia, resultados[0].contrasenia, (error, result) => {
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
          });






          require('./routes')(app);
          const port = process.env.PORT || 8000;
          app.set('port', port);
          const server = http.createServer(app);
          server.listen(port);
          module.exports = app;

