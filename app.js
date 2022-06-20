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
const { check, validationResult } = require('express-validator');

// Log requests to the console.
app.use(logger('dev'));
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({ origin: '*' }));

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
app.use('/signup', [
     check('data.mail', 'El email es obligatorio').not().isEmpty(), // comprueba si el mail esta vacio antes de ir a guardarlo
     check('data.mail', 'El email es inválido').isEmail(), // comprueba que tenga formato de email
     check('data.nickname', 'El alias es obligatorio').not().isEmpty()
], async (req, res) => {
     try {
          if (req.method === 'POST') {

               const errors = validationResult(req); // valido si alguno de los checks fallo
               if (!errors.isEmpty()) { // si hubieron fallas 
                    return res.status(422).json({ errors: errors.array() }); // status 422: no se ha podido crear entidad, devuelvo como json un array con todos los errores
               }

               //valido si mail ya existe
               const resultadosMail = await usuario.findAll({
                    attributes: ['mail', 'habilitado'],
                    raw: true,
                    where: {
                         mail: req.body.data.mail
                         //,contrasenia: bcrypt.hashSync(req.body.data.contrasenia, 10)
                    }
               });
               if (resultadosMail.length === 0) {
                    await logeo.create({
                         mail: req.body.data.mail,
                         contrasenia: bcrypt.hashSync(req.body.data.contrasenia, 10)
                    })
                    res.status(200).json({
                         message: "usuario creado correctamente"
                    })
               } else {
                    console.log(resultadosMail)
                    try {
                         console.log(resultadosMail[0])
                    }
                    catch (err) {
                         console.log("not an array");
                    }
                    // Validar si registro del mail en uso fue completado con éxito!
                    if (resultadosMail[0].habilitado === 1) {
                         res.status(200).json({
                              message: "mail en uso"
                         })
                    }
                    else {
                         res.status(200).json({
                              message: "registro incompleto"
                         })
                    }

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
                    await usuario.create({
                         mail: req.body.data.mail,
                         nickname: req.body.data.nickname,
                         habilitado: -1,
                         nombre: null,
                         avatar: null,
                         tipo_usuario: "INVITADO"
                    })
                    /*
                    Comento esto porque sino el endpoint manda la response acá, y no en la parte de enviar el código por mail 
                    (aunquela ejecuta igual, no sería correcto devolver ok antes de tiempo)
                    res.status(200).json({
                         message: "usuario creado correctamente"
                    })
                    */
               } else {
                    res.status(200).json({
                         message: "alias en uso"
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
                         //res.status(200).send("correo enviado")
                          validador.create({
                              mail: req.body.data.mail,
                              codigo: codigoReg
                         })
                         res.status(200).json({
                              message: "código creado correctamente"
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
          if (req.method === 'POST') {
               //valido si mail ya existe
               const resultadosCodigo = await validador.findAll({
                    attributes: ['codigo'],
                    raw: true,
                    where: {
                         mail: req.body.data.mail
                    }
               })
               if (resultadosCodigo === req.body.data.codigo) {
                    //Borrar código?
                    /*
                    await validador.destroy({
                         where:{mail:req.body.data.mail}
                    });
                    */

                    //hago el update a la tabla de usuario cuando el usuario ya quedo validado
                    const updatedRows = await usuario.update(
                         {
                              habilitado: 1,
                         },
                         {
                              where: { mail: req.body.data.mail },
                         }
                    );
                    console.log(updatedRows);
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

/* Crear contraseña */
app.use('/password', async (req, res) => { // Utilizado cuando el usuario crea su contraseña (sea por primera vez o por recuperacion)
     try {
          if (req.method === 'POST') {
               //valido si mail ya existe
               const resultadosMail = await usuario.findAll({
                    attributes: ['mail'],
                    raw: true,
                    where: {
                         mail: req.body.data.mail
                         //,contrasenia: bcrypt.hashSync(req.body.data.contrasenia, 10)
                    }
               });
               if (resultadosMail.length === 0) {
                    res.status(200).json({
                         message: "Mail inexistente"
                    })
               } else {
                    let password = bcrypt.hashSync(req.body.data.contrasenia, 10); // Encripta la contraseña: 10 es el numero de veces que se aplica el algoritmo de encriptacion
                    await logeo.create({
                         mail: req.body.data.mail,
                         contrasenia: password
                    })
                    //Actualizar usuario como habilitado?
                    /*
                    await usuario.update({...resultadosMail[0],habilitado: 'Si'},{
                         where:{idUsuario:resultadosMail[0].idUsuario}
                    })
                    */
                    res.status(200).json({
                         message: "usuario creado con éxito"
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
          console.log(req.body.data.mail)
          if (req.method === 'POST') {
               const resultados = await logeo.findAll({
                    attributes: ['contrasenia'],
                    raw: true,
                    where: {
                         mail: req.body.data.mail
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
                                        //user : resultados[0]
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

app.use('/recover', [
     check('data.mail', 'El email es inválido').isEmail(), // comprueba que tenga formato de email
], async (req, res) => { // Utilizado cuando el usuario olvida su contraseña, e ingresa su email para recuperarla
     try {
          if (req.method === 'POST') {
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
                    res.status(200).json({
                         message: "Mail inexistente"
                    })
               } else {
                    /////////////// GENERA CODIGO Y ENVIA AL USUARIO
                    var codigoReg = randomExt.integer(999999, 100000);
                    var mailOptions = {
                         from: 'Recetips',
                         to: req.body.data.mail,
                         subject: 'Recupero de contraseña',
                         text: 'Hola! El código que debés ingresar para recuperar tu clave es ' + codigoReg
                    };
                    //envio el mail y cargo el codigo en la tabla
                    transporter.sendMail(mailOptions, function (error, info) {
                         if (error) {
                              res.status(500).send("error en el envio")
                         } else {
                              //res.status(200).send("correo enviado")
                               validador.create({
                                   mail: req.body.data.mail,
                                   codigo: codigoReg
                              })
                              res.status(200).json({
                                   message: "Código de recuperación creado correctamente"
                              })
                         }
                    });
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

