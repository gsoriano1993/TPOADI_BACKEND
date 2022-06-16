/* Controllers */
const usuarioController = require('../controllers/controllerUsuario');
const tipoController = require('../controllers/controllerTipo');
const recetaController = require('../controllers/controllerReceta');
const logeoController = require('../controllers/controllerLogeo');
//const validadorController =require('../controllers/controllerValidador');

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const moment = require('moment');
const jwt = require('jwt-simple');


module.exports = (app) => {
   app.get('/', (req, res) => res.status(200).send({
      message: 'Direccion incorrecta!!',
   }));

   app.post('/usuario/create/logeo', logeoController.create)

   //receta
   app.get('/receta/list', recetaController.list);
   app.get('/receta/buscar/:nombre', recetaController.find);
   app.delete('/receta/eliminar/:nombre', recetaController.destroy);
   app.post('/usuario/create/receta', recetaController.create);

   //registro
   //app.post('/usuario/create/tipo', validadorController.EmailCtrl); //generar aca el controller del validador

   //tipo
   app.post('/usuario/create/tipo', tipoController.create);
   app.get('/tipo/list', tipoController.list);

   //usuario
   app.get('/usuario/list', usuarioController.list);
   app.get('/usuario/find/user/:mail', usuarioController.find);

   //email
   var EmailCtrl = require('../controllers/mailCtrl')
   
   //email router
   app.post('/email', EmailCtrl.sendEmail);

};