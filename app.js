const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
// This will be our application entry. We'll setup our server here.
const http = require('http');
const cors = require('cors');
const { sequelize } = require('./models');
const { Sequelize, Op } = require("sequelize");
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
const utilizado = require('./models').utilizado;
const bcrypt = require('bcryptjs');
const usuario = require('./models').usuario;
const conversion = require('./models').conversiones;
const personalizacion = require('./models').personalizado;
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
                    },
                    order: [['idReceta', 'DESC']]
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
               await paso.destroy({
                    where: { idReceta: req.params.idReceta }
               });

               const idIngredientes = await utilizado.findAll({
                    attributes: ["idIngrediente"],
                    where: { idReceta: req.params.idReceta }
               })

               await ingrediente.destroy({
                    where: { idIngrediente: { [Op.in]: idIngredientes } }
               })

               await utilizado.destroy({
                    where: { idReceta: req.params.idReceta }
               })
               await foto.destroy({
                    where: { idReceta: req.params.idReceta }
               })
               const resultadosRecetas = await receta.destroy({
                    where: { idReceta: req.params.idReceta }
               });
               console.log(`recetas eliminadas: ${resultadosRecetas}`)
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

               /*const [results, metadata] = await sequelize.query(
                    "SELECT recetas.*, pasos.*, ingredientes.*, utilizados.* FROM adi.recetas JOIN adi.utilizados ON recetas.idreceta = utilizados.idreceta join adi.ingredientes on ingredientes.idingrediente= utilizados.idingrediente join adi.pasos on pasos.idreceta=recetas.idreceta"
               );
               var resultadosCategoria = results;
               console.log(resultadosCategoria);
               var resultadoFiltrado=resultadosCategoria.filter(elem=>elem.idReceta===req.params.idReceta)
               console.log("ahora muestro filtrado");
               console.log(resultadoFiltrado)*/
               // Agregar logica que trae los ingredientes, pasos, unidades, etc 

               let ingredientesUtilizados = await utilizado.findAll({
                    where: {
                         idReceta: req.params.idReceta
                    }
               })

               console.log("Utilizados:");
               console.log(ingredientesUtilizados)

               let counter = 0;
               let ingredientsData = []
               while (counter < ingredientesUtilizados.length) {
                    let nombreIng = await ingrediente.findOne({
                         where: {
                              idIngrediente: ingredientesUtilizados[counter].idIngrediente
                         }
                    })
                    if (nombreIng) {
                         ingredientsData.push({ "cantidad": ingredientesUtilizados[counter].cantidad, "ingrediente": nombreIng.nombre, "unidad": ingredientesUtilizados[counter].idUnidad });
                    }
                    else {
                         ingredientsData.push({ ...ingredientesUtilizados[counter] });
                    }
                    counter = counter + 1;
               }

               const dataPasos = await paso.findAll({
                    where: {
                         idReceta: req.params.idReceta
                    }
               })

               // Objeto tentativo a devolver:

               let fullRecipe = {
                    ...recetaBuscada,
                    ingredientes: [...ingredientsData], // estructura: {"cantidad" , "1", "unidad": "1",  "ingrediente" : "Leche" },
                    pasos: [...dataPasos]
               }


               if (recetaBuscada) {
                    res.status(200).json({
                         message: "receta encontrada",
                         data: fullRecipe
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

               const idRecetaCreado = resultadoCreacionRegistro[0].idReceta.toString();

               console.log("aca imprimo el id de receta")
               console.log(idRecetaCreado);  //aca te devuelvo el idReceta
               console.log("aca arranco la carga de ingredientes")


               let counter = 0;
               let myIngredients = req.body.data.ingredientes;
               while (counter < myIngredients.length) {
                    await ingrediente.create({
                         nombre: myIngredients[counter].ingrediente,

                    })
                    counter++;
               }
               /*
                              req.body.data.ingredientes.forEach(async(elem) => {
                                   console.log(elem.ingrediente);
                                   await ingrediente.create({
                                        nombre: elem.ingrediente,
                                   })
                              });
               */

               counter = 0;
               let myPasos = req.body.data.pasos;
               while (counter < myPasos.length) {
                    await paso.create({
                         idReceta: idRecetaCreado,
                         nroPaso: myPasos[counter].nroPaso,
                         texto: myPasos[counter].texto,
                    })
                    counter++;
               }
               /*
                              console.log("aca arranco la carga de pasos")
                              req.body.data.pasos.forEach(async(elem) => {
                                   console.log(elem)
                                   await paso.create({
                                        idReceta: idRecetaCreado,
                                        nroPaso: elem.stepNumber,
                                        texto: elem.description,
                                   })
                              });
               */
               console.log("aca arranco la carga de utilizados")

               req.body.data.ingredientes.forEach(async (elem) => {
                    const resultadoIngrediente = await ingrediente.findAll({
                         attributes: ["idIngrediente"],
                         raw: true,
                         limit: 1,
                         where: {
                              nombre: elem.ingrediente
                         }
                    })
                    console.log(resultadoIngrediente[0])
                    await utilizado.create({
                         cantidad: elem.cantidad,
                         idReceta: idRecetaCreado,
                         idIngrediente: resultadoIngrediente[0].idIngrediente.toString(),
                         idUnidad: elem.unidad,  //me la pasas por el front
                         observaciones: '',
                    })

               });
               res.status(200).json({
                    message: "Receta creada correctamente",
                    data: idRecetaCreado
               })
               //unidades
               /*
               se carga a mano esa para que el front pase los id 
               */

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


app.use('/busqueda', async (req, res) => {
     try {
          if (req.method === 'POST') {
               if (req.body.atributoOrdenamiento === 'Alfabeticamente') {
                    var Ordenamiento = ' order by recetas.nombre'
               } if (req.body.atributoOrdenamiento === 'Nuevas Primero') {
                    var Ordenamiento = ' order by recetas.idreceta desc';
               } if (req.body.atributoOrdenamiento === 'Usuario') {
                    var Ordenamiento = ' order by usuarios.nickname';
               }
               //Busqueda de receta por usuario
               if (req.body.atributoBusqueda === 'Usuario') {
                    var filtro = "'"+req.body.nombreUsuario+"'"
                    var query = "SELECT distinct recetas.nombre, usuarios.nickname FROM adi.recetas JOIN adi.usuarios ON recetas.idusuario = usuarios.idusuario where usuarios.nickname= " + filtro + Ordenamiento
                    console.log(query);
                    const [results, metadata] = await sequelize.query(
                         query
                    );
                    console.log(JSON.stringify(results, null, 2))
                    res.status(200).json({
                         message: "Busqueda finalizada correctamente",
                         data: results
                    })
               }
               //Busqueda por nombre de receta
               if (req.body.atributoBusqueda === 'Receta') {
                    var filtro = "'%" + req.body.nombreReceta + "%'"
                    var query = "SELECT distinct recetas.nombre, usuarios.nickname FROM adi.recetas JOIN adi.usuarios ON recetas.idusuario = usuarios.idusuario where recetas.nombre like " +filtro+ Ordenamiento
                    const [results, metadata] = await sequelize.query(
                         query, {})
                    res.status(200).json({
                         message: "Busqueda finalizada correctamente",
                         data: results
                    })
               }
               //busco recetas que contengan ese ingrediente
               if (req.body.atributoBusqueda === 'Ingrediente' && req.body.atributoContiene === 'Contiene') {
                    var filtro="'"+req.body.nombreIngrediente+"'"
                    var query='SELECT distinct recetas.nombre, usuarios.nickname FROM adi.recetas inner join adi.utilizados on utilizados.idReceta=recetas.idReceta JOIN adi.ingredientes ON utilizados.idingrediente = ingredientes.idingrediente inner join adi.usuarios on usuarios.idusuario = recetas.idusuario where ingredientes.nombre='+filtro+Ordenamiento
                    const [results, metadata] = await sequelize.query(
                         query, {
                    }
                    );
                    console.log(JSON.stringify(results, null, 2))
                    res.status(200).json({
                         message: "Busqueda finalizada correctamente",
                         data: results
                    })
               }
               //busco recetas que NO contengan ese ingrediente
               if (req.body.atributoBusqueda === 'Ingrediente' && req.body.atributoContiene === 'No Contiene') {
                    var filtro= "'"+req.body.nombreIngrediente+"'"
                    var query='SELECT distinct recetas.nombre, usuarios.nickname FROM adi.recetas inner join adi.utilizados on utilizados.idReceta=recetas.idReceta JOIN adi.ingredientes ON utilizados.idingrediente = ingredientes.idingrediente inner join adi.usuarios on usuarios.idusuario = recetas.idusuario where ingredientes.nombre <>'+filtro+Ordenamiento
                    const [results, metadata] = await sequelize.query(
                         query, {    
                    }
                    );
                    console.log(JSON.stringify(results, null, 2))
                    res.status(200).json({
                         message: "Busqueda finalizada correctamente",
                         data: results
                    })
               }
          }
     } catch {
          //      console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});

// Personalizacion de receta x comensal
app.use('/recetapersonalizada/:idReceta', async (req, res) => {
     try {
          if (req.method === 'POST') {
               const recetaBuscada = await receta.findOne({
                    where: {
                         idReceta: req.params.idReceta
                    }
               })
               const factorConversion = req.body.data.porciones / recetaBuscada.cantidadPersonas;
               await personalizado.create({
                    idReceta: req.params.idReceta,
                    idUsuario: req.params.idUsuario,
                    factorConversion: factorConversion
               })
          }
     }
     catch (error) {
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

/*
app.use('/recetaPrueba', async (req, res) => {
     try {
          if (req.method === 'GET') {
               const [results, metadata] = await sequelize.query(
                    'SELECT recetas.nombre, usuarios.nickname FROM adi.recetas JOIN adi.usuarios ON recetas.idusuario = usuarios.idusuario where recetas.idusuario=:idUsuario', {
                    replacements: { idUsuario: req.body.idUsuario }
               }
               );
               console.log(JSON.stringify(results[0], null, 2))
               res.status(200).json({
                    message: "Se han encontrado las siguientes recetas",
                    data: results
               })
          }
     } catch {
          // console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});


app.use('/recetaPorIngrediente', async (req, res) => {
     try {
          if (req.method === 'GET') {
               const [results, metadata] = await sequelize.query(
                    'SELECT recetas.nombre, usuarios.nickname FROM adi.recetas JOIN adi.ingredientes ON recetas.idreceta = ingredientes.idreceta inner join adi.usuarios on usuarios.idusuario = recetas.idusuario where recetas.nombre=:nombreIngrediente', {
                    replacements: { nombreIngrediente: req.body.nombreIngrediente }
               }
               );
               console.log(JSON.stringify(results, null, 2))
               res.status(200).json({
                    message: "Se han encontrado las siguientes recetas para el ingrediente seleccionado",
                    data: results
               })
          }
     } catch {
          // console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});

app.use('/recetaSinIngrediente', async (req, res) => {
     try {
          if (req.method === 'GET') {
               const [results, metadata] = await sequelize.query(
                    'SELECT recetas.nombre, usuarios.nickname FROM adi.recetas JOIN adi.ingredientes ON recetas.idreceta = ingredientes.idreceta inner join adi.usuarios on usuarios.idusuario = recetas.idusuario where recetas.nombre not in (:nombreIngrediente)', {
                    replacements: { nombreIngrediente: req.body.nombreIngrediente }
               }
               );
               console.log(JSON.stringify(results, null, 2))
               res.status(200).json({
                    message: "Se han encontrado las siguientes recetas que no tengan el ingrediente ",
                    data: results
               })
          }
     } catch {
          // console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});

//Consultar receta por nombre (like)
app.use('/busquedaRecetaNombre/:nombreReceta', async (req, res) => {
     try {
          if (req.method === 'GET') {
               const resultadosRecetasNombre = await receta.findAll({
                    where: { nombre: { [Op.like]: req.params.nombreReceta } }
               })
               res.status(200).json({
                    message: "Se han encontrado las siguientes recetas",
                    data: resultadosRecetasNombre
               })
          }
     } catch {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});
  //Receta por categoria   --> A terminar
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


