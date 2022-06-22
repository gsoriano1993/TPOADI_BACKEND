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
const receta = require('./models').receta;
const paso = require('./models').paso;
const foto = require('./models').foto;
const ingrediente = require('./models').ingrediente;
const bcrypt = require('bcryptjs');
const usuario = require('./models').usuario;
const mailController = require('./controllers/mailCtrl')
const { check, validationResult } = require('express-validator');
var nodemailer = require('nodemailer');
var randomExt = require('random-ext');

/////ENDPOINTS
/*
POST /recetas
PUT /recetas/:idReceta
*/

// Log requests to the console.
app.use(logger('dev'));
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({ origin: '*' }));

///******************** CARGA DE IMAGENES *********************///
// app.use('/upload-images', upload.array('image'), async (req, res) => {
app.use('/uploadimages', upload.array('image'), async (req, res) => {
     try {
          const uploader = async (path) => cloudinary.uploads(path, 'Images');
          console.log("body", req.body)
          console.log("data", req.body.data)
          if (req.method === 'POST') {
               const urls = []
               const files = req.body.data.files;
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
                    attributes: ['mail'],
                    raw: true,
                    where: {
                         mail: req.body.data.mail
                    }
               });
               //valido si nickname ya existe
               const resultadosAlias = await usuario.findAll({
                    attributes: ['nickname'],
                    raw: true,
                    where: {
                         nickname: req.body.data.nickname
                    }
               });
               console.log(resultadosMail.length);
               console.log(resultadosAlias.length);
               if (!(resultadosMail.length === 0)) {
                    res.status(200).json({
                         message: "mail ya usado"
                    })
                    return
               };
               if (!(resultadosAlias.length === 0)) {
                    res.status(200).json({
                         message: "nickname ya usado"
                    })
                    return
               }
               console.log(req.body.data.mail);
               if (resultadosMail.length == 0 && resultadosAlias.length == 0) {
                    usuario.create({
                         mail: req.body.data.mail,
                         nickname: req.body.data.nickname,
                         habilitado: -1,
                         nombre: null,
                         avatar: 'avatar1',
                         tipo_usuario: "INVITADO"
                    })
                    var transporter = nodemailer.createTransport({
                         host: "smtp-mail.outlook.com", // hostname
                         port: 587, // port for secure SMTP
                         secureConnection: false,
                         tls: {
                              ciphers: 'SSLv3'
                         },
                         auth: {
                              user: 'recetips_1@hotmail.com',
                              pass: 'A0303456'
                         }
                    });

                    var codigoReg = randomExt.integer(999999, 100000);
                    var mailOptions = {
                         from: 'Recetips',
                         to: req.body.data.mail,
                         subject: 'Alta de usuario',
                         text: 'Hola! El valor que debés ingresar para finalizar el registro es ' + codigoReg
                    };
                    console.log("llegue hasta aca");
                    console.log(mailOptions);

                    transporter.sendMail(mailOptions, async function (error, info) {
                         if (error) {
                              console.log("Email error", error)
                              res.status(500).json({
                                   message: "error en el envio" + JSON.stringify(error)
                              })
                         } else {
                              console.log("Email enviado correctamente");
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
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
})

//valido si el codigo ingresado por el usuario esta ok
app.use('/validadorCodigo', async (req, res) => {
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
               console.log(resultadosCodigo[0])
               if (resultadosCodigo[0].codigo.toString() == req.body.data.codigo) {
                    //Borrar código?
                    await validador.destroy({
                         where: { mail: req.body.data.mail }
                    });
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

//guardar contraseña
app.use('/password', async (req, res) => {
     try {
          if (req.method === 'POST') {
               await logeo.create({
                    mail: req.body.data.mail,
                    contrasenia: bcrypt.hashSync(req.body.data.contrasenia, 10)
               })
               res.status(200).json({
                    message: "usuario creado correctamente"
               })
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
                    bcrypt.compare(req.body.data.contrasenia, resultados[0].contrasenia, async (error, result) => {
                         if (error) {
                              console.error('Error: ', error);
                         } else {
                              //console.log('Credenciales correctas?: ', result ) // true o false
                              if (result === true) {
                                   const dataUsuario = await usuario.findOne({
                                        where: {
                                             mail: req.body.data.mail
                                        }
                                   });
                                   res.status(200).json({
                                        message: "credenciales ok, bienvenido",
                                        user: dataUsuario
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

                    var transporter = nodemailer.createTransport({
                         host: "smtp-mail.outlook.com", // hostname
                         port: 587, // port for secure SMTP
                         secureConnection: false,
                         tls: {
                              ciphers: 'SSLv3'
                         },
                         auth: {
                              user: 'recetips_1@hotmail.com',
                              pass: 'A0303456'
                         }
                    });

                    //envio el mail y cargo el codigo en la tabla
                    transporter.sendMail(mailOptions, function (error, info) {
                         if (error) {
                              console.log("Erorr al enviar el mail: ", error)
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

///******************** RECETAS *********************///
//** BUSCAR RECETAS DEL USUARIO */
app.use('/recetabyuser/:idUsuario', async (req, res) => {
     try {
          if (req.method === 'GET') {
               const resultadosRecetas = await receta.findAll({
                    where: {
                         idUsuario: req.params.idUsuario
                    }
               });
               if (resultadosRecetas.length === 0) {
                    res.status(200).json({
                         message: "Este usuario no posee recetas"
                    })
               } else {
                    res.status(200).json({
                         message: "recetas encontrada",
                         data: resultadosRecetas
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


//** OBTENER, EDITAR Y ELIMINAR RECETAS => Por su ID (Porque en el front uno selecciona una receta que ya fue obtenida previamente, y se tiene el idReceta disponible) */
app.use('/receta/:idReceta', async (req, res) => {
     try {
          if (req.method === 'DELETE') {
               const resultadosRecetas = await receta.destroy({
                    where: {
                         idReceta: req.params.idReceta,
                    }
               });
               if (resultadosRecetas === 1) {
                    res.status(200).json({
                         message: "Receta eliminada exitosamente"
                    })
               }
               else {
                    res.status(200).json({
                         message: "Receta no encontrada"
                    })
               }
          }
          if (req.method === 'PUT') {
               await receta.update(req.body, {
                    where: {
                         idReceta: req.params.idReceta,
                    }
               });
               res.status(200).json({
                    message: "Receta editada exitosamente"
               })
          }
          if (req.method === 'GET') {
               const recetaBuscada = await receta.findOne({
                    where: {
                         idReceta: req.params.idReceta
                    }
               })
               /* Agregar logica que trae los ingredientes, pasos, unidades, etc 
               
               const ingredientesUtilizados = await utilizados.findAll({
                    where : {
                         idReceta : req.params.idReceta
                    }
               })

               ingredientesUtilizados.map(async (ing) => {
                    let nombreIng = await ingredientes.findOne({
                         where : {
                              idIngrediente : ing.idIngrediente
                         }
                    })
                    if(nombreIng){
                         return {...ing, "ingrediente" : nombreIng}
                    }
                    return ing;
               })

               let dataIngredientes = [];

               ingredientesUtilizados.forEach((ing) => {
                    dataIngredientes.push({
                         "ingrediente": ing.ingrediente,
                         "unidad": ing.idUnindad,
                         "cantidad": ing.cantidad
                    })
               })

               const dataPasos = await pasos.findAll({
                    where: {
                         idReceta: req.params.idReceta
                    }
               })
               
               */
               /* 
               
               Objeto tentativo a devolver:

               let fullRecipe = {
                    ...recetaBuscada,
                    ingredientes: dataIngredientes // estructura: {"cantidad" , "1", "unidad": "1",  "ingrediente" : "Leche" },
                    pasos: dataPasos 
               }

               */
               if (recetaBuscada) {
                    res.status(200).json({
                         message: "receta encontrada",
                         data: recetaBuscada
                    });
               }
               else {
                    res.status(200).json({
                         message: "receta no encontrada"
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

app.use('/crearReceta/:idUsuario', async (req, res) => {
     console.log("aca voy a empezar el try")
     try {
          if (req.method === 'POST') {
               console.log("carga de receta")
               const resultadosCreacion = await receta.create({
                    idUsuario: req.params.idUsuario,
                    nombre: req.body.data.nombre,
                    descripcion: req.body.data.descripcion,
                    foto: req.body.data.foto,
                    porciones: req.body.data.porciones,
                    cantidadPersonas: req.body.data.porciones,
                    idTipo: req.body.data.idTipo
               })
               console.log(resultadosCreacion)
               //busco la ultima receta generada por ese usuario
               
               const resultadoCreacionRegistro = await receta.findAll({
                    attributes: ["idReceta"],
                    raw: true,
                    limit: 1,
                    where: {
                         idUsuario: req.params.idUsuario
                    },
                    order: [['idReceta', 'DESC']]
               })
               console.log("aca imprimo el id de receta")
               console.log(resultadoCreacionRegistro[0].idReceta.toString());  //aca te devuelvo el idReceta
               res.status(200).json({
                    message: "usuario creado correctamente",
                    data: resultadoCreacionRegistro[0].idReceta.toString()
               })
               console.log("aca imprimo la longitud del array de ingredientes")
               console.log("ahora entro en el bucle de la longitud")

               req.body.data.ingredientes.forEach(elem => {
                    await ingrediente.create({
                         nombre: elem.ingrediente,
                    })
                    console.log(elem.ingrediente)
               });

               console.log("aca voy a imprimir la longitud del array de los pasos")     
               const longitud = req.body.data.pasos.length;
               console.log(longitud);
                         /*
               //aca cargo el paso
               const resultadoCreacionPaso = await paso.create({
                    idReceta: resultadoCreacionRegistro[0].idReceta.toString(),
                    nroPaso: req.body.data.nroPaso,
                    texto: req.body.data.texto
               })

               //cargo foto de la receta --> aca primero tiene que correr el endpoint de '/upload-images'
               const resultadoCargaFoto = await foto.create({
                    extension: req.body.data.extension, //buscar en el body del front donde guarda la extension de la imagen
                    idReceta: resultadoCreacionRegistro[0].idReceta.toString(),
                    urlFoto: 1//es el resultado de la carga de imagen
               })*/
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});


/*
//CREAR RECETA
app.use('/receta/crearReceta', async (req, res) => {
     try {
          if (req.method === 'POST') {
                    await  receta.create({
                    idUsuario: req.body.data.idUsuario,
                    nombre: req.body.data.nombre,
                    descripcion: req.body.data.descripcion,
                    foto: req.body.data.foto,
                    porciones: req.body.data.porciones,
                    cantidadPersonas: req.body.data.cantidadPersonas,
                    idTipo: req.body.data.idTipo //a chequear
               }).then (result => console.log(result.idReceta))
               /*const getIdReceta = await receta.findAll({
                    attributes:["idReceta"],
                    raw: true,
                    where: {
                         idUsuario: req.body.data.idUsuario
                    }
               })
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});

*/
/*   //Receta por categoria   --> A terminar
   app.use('/receta/recetaCategoria', async (req, res) => {
        try {
             if (req.method === 'GET') {

                  const [results, metadata] = await sequelize.query(
                       "SELECT recetas.* FROM adi.recetas JOIN adi.tipos ON recetas.idTipo = tipos.idTipo"
                  );
                  var resultadosCategoria = results.filter(function (e) { return e.descripcion == req.body.data.categoria });
             }
             console.log(JSON.stringify(resultadosCategoria, null, 2));
             if (resultadosCategoria.length === 0) {
                  res.status(200).json({
                       message: "No existe receta para esa categoria"
                  })
             }
        } catch (error) {
             console.log("Catch error", error)
             res.status(500).json({
                  message: 'Ocurrio un error inesperado',
             })
        }
   });

*/

require('./routes')(app);
const port = process.env.PORT || 8000;
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
module.exports = app;


