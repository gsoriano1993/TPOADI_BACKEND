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


app.use('/validarCredenciales', async (req, res) => {
     if (req.method === 'GET') {
          const resultados = await findAll({
               attributes: ['contrasenia'],
               where: {
                    mail: req.body.mail
                    //,contrasenia: bcrypt.hashSync(req.body.contrasenia, 10)
               }});
               bcrypt.compare(req.body.contrasenia, resultados, (error, result) => {
                    if (error) {
                         console.error('Error: ', error);
                    } else {
                         console.log('Is the password correct: ', result); // true or false
                    }
               })
                res.json(200).send()
          }
});







require('./routes')(app);
const port = process.env.PORT || 8000;
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
module.exports = app;