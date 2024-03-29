const Sequelize = require('sequelize');
const receta = require('../models/').receta;
module.exports = {
    create(req, res) {
        return receta
            .create({
                idUsuario: req.body.idUsuario,
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                foto: req.body.foto,
                porciones: req.body.porciones,
                cantidadPersonas:req.body.cantidadPersonas,
                idTipo: req.body.idTipo  
            })
            .then(receta => res.status(200).send(receta))
            .catch(error => res.status(400).send(error))
    },
    
    list(_, res) {
        return receta.findAll({
            attributes : ['nombre',  'descripcion', 'foto', 'porciones', 'cantidadPersonas']
        })
            .then(receta => res.status(200).send(receta))
            .catch(error => res.status(400).send(error))
    },
    find(req, res) {
        return receta.findAll({
            where: {
                nombre: req.params.nombre,
            },
            order: [ req.body.nombre, "ASC"]  //por defecto ordeno por nombre
            
        })
            .then(receta => res.status(200).send(receta))
            .catch(error => res.status(400).send(error))
    },
    destroy(req, res){
        return receta.destroy({
            where: {
                nombre: req.param.nombre,
            }
        })
            .then(receta => res.status(200).send(receta))
            .catch(error => res.status(400).send(error))
        }
};
