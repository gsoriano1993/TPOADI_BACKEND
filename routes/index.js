/* Controllers */
const usuarioController = require('../controllers/controllerUsuario');
const tipoController = require('../controllers/controllerTipo');
const recetaController = require('../controllers/controllerReceta');
module.exports = (app) => {
   app.get('/api', (req, res) => res.status(200).send ({
        message: 'Example project did not give you access to the api web services',
   }));
   app.post('/api/usuario/create/tipo', tipoController.create);
   app.post('/api/usuario/create/receta', recetaController.create);
   app.get('/api/usuario/list', usuarioController.list);
   app.get('/api/usuario/find/username/:username', usuarioController.find);
   app.get('/api/tipo/list', tipoController.list);
};