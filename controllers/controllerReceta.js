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
            .then(tipo => res.status(200).send(receta))
            .catch(error => res.status(400).send(error))
    },
    list(_, res) {
        return tipo.findAll({
            attributes : ['idTipo',  'descripcion']
        })
            .then(tipo => res.status(200).send(receta))
            .catch(error => res.status(400).send(error))
    },
    find(req, res) {
        return receta.findAll({
            where: {
                username: req.params.username,
            }
        })
            .then(tipo => res.status(200).send(receta))
            .catch(error => res.status(400).send(error))
    },
};
