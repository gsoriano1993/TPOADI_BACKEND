/* Controllers */
const usuarioController = require('../controllers/controllerUsuario');
const tipoController = require('../controllers/controllerTipo');
const recetaController = require('../controllers/controllerReceta');
module.exports = (app) => {
   app.get('/api', (req, res) => res.status(200).send ({
        message: 'Direccion incorrecta',
   }));
   
   //tipo
   app.post('/api/usuario/create/tipo', tipoController.create);
   app.get('/api/tipo/list', tipoController.list);

   //usuario
   app.get('/api/usuario/list', usuarioController.list);
   app.get('/api/usuario/find/username/:username', usuarioController.find);
   app.post('/api/usuario/create/receta', recetaController.create);

   //receta
   app.get('/api/receta/list', recetaController.list);
   app.get('/api/receta/buscar/:nombre', recetaController.find);
   app.delete('/api/receta/eliminar/:nombre', recetaController.destroy);
   
};