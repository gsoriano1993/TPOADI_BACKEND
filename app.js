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
//const cloudinary = require('./cloudinary')
const cloudinary = require('cloudinary');
const fs = require('fs');
const logeo = require('./models').logeo;
const favorito = require('./models').favorito;
const validador = require('./models').validador;
const receta = require('./models').receta;
const paso = require('./models').paso;
const foto = require('./models').foto;
const ingrediente = require('./models').ingrediente;
const utilizado = require('./models').utilizado;
const tipo = require('./models').tipo;
const unidad = require('./models').unidad;
const multimedia = require('./models').multimedia;
const bcrypt = require('bcryptjs');
const usuario = require('./models').usuario;
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



app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({ origin: '*' }));

///******************** CARGA DE IMAGENES *********************///
cloudinary.config({
     cloud_name: 'gsoriano', //process.env.CLOUD_NAME,
     api_key: '838966766312973',//process.env.CLOUDINARY_API_KEY,
     api_secret: 'JJb9sPAzENTJoYtcBDSWqwwGOWU' //process.env.CLOUDINARY_API_SECRET
})

app.use('/uploadImagen', async (req, res) => {
     try {
          if (req.method === 'POST') {
               var dataURI = req.body.dataURI;
               var uploadStr = 'data:image/jpeg;base64,' + dataURI;

               const subidaImagen = cloudinary.v2.uploader.upload(uploadStr, {
                    overwrite: true,
                    invalidate: true,
                    width: 810, height: 456, crop: "fill"
               });
               subidaImagen.then(value => {
                    const valor = value;
                    /*foto.create({
                         idReceta: req.params.idReceta,
                         urlFoto: valor.url,
                         extension: valor.format
                    })*/
                    res.status(200).json({
                         urlFoto: valor.url,
                         extension: valor.format
                    })
               }).catch(err => {
                    console.log(err);
               });
          }

     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});




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
               var query= "delete from adi.multimedia where idpaso in (select idpaso from adi.pasos where pasos.idreceta ='"+req.params.idReceta+"')"
               const [results, metadata] = await sequelize.query(
                    query
               );

                query= "delete from adi.pasos where idreceta='"+req.params.idReceta+"'";
                const [results2, metadata2] = await sequelize.query(
                    query
               );

               const integredientes = await utilizado.findAll({
                    attributes: ["idIngrediente"],
                    raw: true,
                    where: { idReceta: req.params.idReceta }
               })

               await utilizado.destroy({
                    where: { idReceta: req.params.idReceta }
               })
               console.log("Ingredientes a eliminar", integredientes)
               await ingrediente.destroy({
                    where: { idIngrediente: { [Op.in]: [...integredientes.map(item => item.idIngrediente)] } }
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
                    attributes: ['idPaso','idReceta', 'texto','nroPaso'],
                    raw: true,
                    where: {
                         idReceta: req.params.idReceta
                    }
               })

               counter = 0
               let pasosFinal = [...dataPasos];
               while(counter < dataPasos.length){
                    let media = await multimedia.findAll({
                         attributes: ['extension', 'idPaso','tipo_contenido','urlContenido'],
                         raw: true,
                         where: {
                              idPaso: dataPasos[counter].idPaso
                         }
                    })
                    pasosFinal[counter] = {...pasosFinal[counter], "media": [...media]}
                    counter = counter + 1;
               }

               // Objeto tentativo a devolver:

               let fullRecipe = {
                    ...recetaBuscada,
                    ingredientes: [...ingredientsData], // estructura: {"cantidad" , "1", "unidad": "1",  "ingrediente" : "Leche" },
                    pasos: [...pasosFinal]
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

app.use('/listaCategorias', async (req, res) => {
     try {
          if (req.method === 'GET') {
               const [listadoCategorias, metadata] = await sequelize.query(
                    "SELECT tipos.idtipo, tipos.descripcion, fotoscategorias.urlfoto FROM adi.tipos inner join adi.fotoscategorias on tipos.idtipo= fotoscategorias.id "
               );
               res.status(200).json({
                    message: "Busqueda finalizada correctamente",
                    data: listadoCategorias
               })
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});




app.use('/listaUnidades', async (req, res) => {
     try {
          if (req.method === 'GET') {
               const listadoUnidades = await unidad.findAll({
                    raw: true
               })
               res.status(200).json({
                    message: "Busqueda finalizada correctamente",
                    data: listadoUnidades
               })
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});

app.use('/listaIngredientes', async (req, res) => {
     try {
          if (req.method === 'GET') {
               const listadoIngredientes = await ingrediente.findAll({
                    raw: true
               })
               res.status(200).json({
                    message: "Busqueda finalizada correctamente",
                    data: listadoIngredientes
               })
          }
     } catch (error) {
          console.log("Catch error", error)
          res.status(500).json({
               message: 'Ocurrio un error inesperado',
          })
     }
});

//Utilizada en HomeScreen
app.use('/obtenerRecetasNuevas', async (req, res) => {
     try {
          if (req.method === 'GET') {
               var Ordenamiento = ' order by recetas.idreceta desc';
               var query = "SELECT distinct usuarios.nickname, usuarios.idusuario,  multimedia.urlcontenido , recetas.* FROM adi.recetas JOIN adi.usuarios ON recetas.idusuario = usuarios.idusuario left   JOIN adi.pasos on pasos.idreceta=recetas.idreceta  left JOIN adi.multimedia on multimedia.idpaso=pasos.idpaso  left join adi.tipos on recetas.idtipo=tipos.idtipo " + Ordenamiento
               const [results, metadata] = await sequelize.query(
                    query, {})
               res.status(200).json({
                    message: "Busqueda finalizada correctamente",
                    data: results
               })
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
               let resultadosCreacion=[];
          if(req.body.data.foto==null){ //ver aca si esta bien el if para cuando no cargan foto en la receta
                resultadosCreacion = await receta.create({
                    idUsuario: req.params.idUsuario,
                    nombre: req.body.data.nombre,
                    descripcion: req.body.data.descripcion,
                    foto: null,
                    porciones: req.body.data.porciones,
                    cantidadPersonas: req.body.data.porciones,
                    idTipo: req.body.data.idTipo
               })
          }else{
                resultadosCreacion = await receta.create({
                    idUsuario: req.params.idUsuario,
                    nombre: req.body.data.nombre,
                    descripcion: req.body.data.descripcion,
                    foto: req.body.data.foto.urlFoto,
                    porciones: req.body.data.porciones,
                    cantidadPersonas: req.body.data.porciones,
                    idTipo: req.body.data.idTipo
               })
          }
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
               if(req.body.data.foto != null){
                    await foto.create({
                         idReceta: idRecetaCreado,
                         urlFoto: req.body.data.foto.urlFoto,
                         extension: req.body.data.foto.extension
                    })
               }

               console.log("aca imprimo el id de receta")
               console.log(idRecetaCreado);  //aca te devuelvo el idReceta
               console.log("aca arranco la carga de ingredientes")


               let counter = 0;
               let myIngredients = req.body.data.ingredientes;
               let ingredientIDs = [];
               while (counter < myIngredients.length) {
                    var query = "SELECT ingredientes.idIngrediente FROM adi.ingredientes where LOWER(ingredientes.nombre) = '" +  myIngredients[counter].ingrediente.toLowerCase()+"' limit 1";
                    console.log("Query: " + query);
                    const  [ingredienteExistente, metadata] = await sequelize.query(
                         query,
                    );
                    console.log("Creacion de ingredientes: " + counter + " / " + myIngredients.length);
                    console.log("Ingrediente Existente: ", ingredienteExistente)
                    if(ingredienteExistente.length == 0){
                         await ingrediente.create({
                              nombre: myIngredients[counter].ingrediente
                         })
                         let createdIng = await ingrediente.findAll({
                              attributes: ["idIngrediente"],
                              raw: true,
                              limit: 1,
                              order: [['idIngrediente', 'DESC']],
                              where: {
                                   nombre: myIngredients[counter].ingrediente
                              }
                         })
                         console.log("createdIng",createdIng);

                         ingredientIDs.push(createdIng[0].idIngrediente);
                    }
                    else{
                         console.log("Existing id",ingredienteExistente);

                         ingredientIDs.push(ingredienteExistente[0].idIngrediente)
                    }
                    console.log("Final IngredientIDs",ingredientIDs);
                    counter = counter + 1;
               }

               counter = 0;
               let myPasos = req.body.data.pasos;
               while (counter < myPasos.length) {
                    console.log("Paso: " + counter + " / " + myPasos.length)
                    let nuevoPaso = await paso.create({
                         idReceta: idRecetaCreado,
                         nroPaso: myPasos[counter].nroPaso,
                         texto: myPasos[counter].texto,
                    })
                    console.log("Paso creado: ", nuevoPaso)
                    const pasoCreado = await paso.findAll({
                         attributes: ["idPaso"],
                         raw: true,
                         limit: 1,
                         where: {
                              idReceta: idRecetaCreado
                         },
                         order: [['idPaso', 'DESC']]
                    })
                    console.log("Paso creado obtenido", pasoCreado);
                    let mediaCounter = 0;
                    while(mediaCounter < myPasos[counter].media.length){
                         console.log("Media numero: " + mediaCounter + " / " + myPasos[counter].media.length);
                         console.log("Elemento: ", myPasos[counter].media[mediaCounter])
                         let nuevaMultimedia = await multimedia.create({
                              idPaso: pasoCreado[0].idPaso,
                              tipo_contenido: 'image',
                              extension: myPasos[counter].media[mediaCounter].extension, //traer de FOTO
                              urlContenido: myPasos[counter].media[mediaCounter].urlFoto
                         })
                         console.log("Nueva multimedia: ", nuevaMultimedia)
                         mediaCounter += 1;
                    }
                    counter++;
               }
               console.log("aca arranco la carga de utilizados")
               counter = 0;
               while(counter < myIngredients.length){
                    let elem = myIngredients[counter];
                    let currentId = ingredientIDs[counter];
                    console.log("Creacion utilizado: " + counter + " / " + myIngredients.length)
                    /*const resultadoIngrediente = await ingrediente.findAll({
                         attributes: ["idIngrediente"],
                         raw: true,
                         limit: 1,
                         where: {
                              idIngrediente: currentId
                         }
                    })
                    console.log(resultadoIngrediente[0])*/
                    let utilizadoCreado = await utilizado.create({
                         cantidad: elem.cantidad,
                         idReceta: idRecetaCreado,
                         idIngrediente: currentId.toString(),
                         idUnidad: elem.unidad,  //me la pasas por el front
                         observaciones: '',
                    })
                    console.log("Creado: " , utilizadoCreado)
                    counter = counter + 1;
               }
               res.status(200).json({
                    message: "Receta creada correctamente",
                    data: idRecetaCreado
               })
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
          console.log("entre al endpoint de busquedas")
          console.log(req.body.data)
          if (req.method === 'POST') {
               if (req.body.data.atributoOrdenamiento === 'Alfabeticamente') {
                    var Ordenamiento = ' order by recetas.nombre'
               } if (req.body.data.atributoOrdenamiento === 'Nuevas Primero') {
                    var Ordenamiento = ' order by recetas.idreceta desc';
               } if (req.body.data.atributoOrdenamiento === 'Usuario') {
                    var Ordenamiento = ' order by usuarios.nickname';
               }
               //Busqueda de receta por usuario
               if (req.body.data.atributoBusqueda === 'Usuario') {
                    var filtro = "'" + req.body.data.nombreUsuario + "'"
                    var query = "SELECT distinct recetas.nombre, usuarios.nickname, usuarios.idusuario, recetas.idreceta , pasos.nropaso, pasos.texto, multimedia.urlcontenido FROM adi.recetas  JOIN adi.usuarios ON recetas.idusuario = usuarios.idusuario  JOIN adi.pasos on pasos.idreceta=recetas.idreceta JOIN adi.multimedia on multimedia.idpaso=pasos.idpaso where usuarios.nickname= " + filtro + Ordenamiento
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
               if (req.body.data.atributoBusqueda === 'Receta') {
                    var filtro = "'%" + req.body.data.nombreReceta + "%'"
                    var query = "SELECT distinct recetas.nombre, usuarios.nickname, usuarios.idusuario, recetas.idreceta, pasos.nropaso, pasos.texto, multimedia.urlcontenido FROM adi.recetas  JOIN adi.usuarios ON recetas.idusuario = usuarios.idusuario  JOIN adi.pasos on pasos.idreceta=recetas.idreceta JOIN adi.multimedia on multimedia.idpaso=pasos.idpaso  where recetas.nombre like " + filtro + Ordenamiento
                    const [results, metadata] = await sequelize.query(
                         query, {})
                    res.status(200).json({
                         message: "Busqueda finalizada correctamente",
                         data: results
                    })
               }
               //busco recetas que contengan ese ingrediente
               if (req.body.data.atributoBusqueda === 'Ingrediente' && req.body.data.atributoContiene === 'Contiene') {
                    var filtro = "'" + req.body.data.nombreIngrediente + "'"
                    var query = 'SELECT distinct recetas.nombre, usuarios.nickname, usuarios.idusuario, recetas.idreceta , pasos.nropaso, pasos.texto, multimedia.urlcontenido FROM adi.recetas JOIN adi.utilizados on utilizados.idReceta=recetas.idReceta JOIN adi.pasos on pasos.idreceta=recetas.idreceta JOIN adi.multimedia on multimedia.idpaso=pasos.idpaso JOIN adi.ingredientes ON utilizados.idingrediente = ingredientes.idingrediente JOIN adi.usuarios on usuarios.idusuario = recetas.idusuario where ingredientes.nombre=' + filtro + Ordenamiento
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
               //busco recetas por categoria
               if (req.body.data.atributoBusqueda === 'Categoria') {
                    var filtro = "'" + req.body.data.nombreCategoria + "'"
                    var query = 'SELECT distinct recetas.nombre, usuarios.nickname, usuarios.idusuario, recetas.idreceta, pasos.nropaso, pasos.texto, multimedia.urlcontenido  FROM adi.recetas inner join adi.tipos on tipos.idtipo=recetas.idtipo inner join adi.usuarios on usuarios.idusuario = recetas.idusuario JOIN adi.pasos on pasos.idreceta=recetas.idreceta JOIN adi.multimedia on multimedia.idpaso=pasos.idpaso where tipos.descripcion=' + filtro + Ordenamiento
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
               if (req.body.data.atributoBusqueda === 'Ingrediente' && req.body.data.atributoContiene === 'No Contiene') {
                    var filtro = "'" + req.body.data.nombreIngrediente + "'"
                    var query = 'SELECT distinct recetas.nombre, usuarios.nickname, usuarios.idusuario, recetas.idreceta , pasos.nropaso, pasos.texto, multimedia.urlcontenido FROM adi.recetas JOIN adi.utilizados on utilizados.idReceta=recetas.idReceta JOIN adi.pasos on pasos.idreceta=recetas.idreceta JOIN adi.multimedia on multimedia.idpaso=pasos.idpaso JOIN adi.ingredientes ON utilizados.idingrediente = ingredientes.idingrediente JOIN adi.usuarios on usuarios.idusuario = recetas.idusuario where ingredientes.nombre <>' + filtro + Ordenamiento
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
               await personalizacion.create({
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


app.use('/favoritos', async (req, res) => {
     try {
          console.log("entre al endpoint de favoritos")
          console.log(req.body.data)
          if (req.method === 'POST') {
               const nuevoFavorito = await favorito.create({
                    idReceta: req.body.data.idReceta,
                    idUsuario: req.body.data.idUsuario
               })
               res.status(200).json({
                    message: "Se agrego correctamente a favoritos",
                    data: results
               })
          } 
          if( req.method === 'GET'){
               var filtro =  req.body.data.idUsuario
               var ordenamiento = ') order by recetas.nombre asc'
                    var query = "select distinct * from adi.recetas where idreceta in (select idreceta from adi.favoritos where favoritos.idusuario =" + filtro + ordenamiento
                    console.log(query);
                    const [results, metadata] = await sequelize.query(
                         query
                    );
                    res.status(200).json({
                         message: "Busqueda finalizada correctamente",
                         data: results
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


