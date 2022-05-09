const Sequelize = require('sequelize');
const tipo = require('../models').tipo;
module.exports = {
    create(req, res) {
        return tipo
            .create({
                descripcion: req.body.descripcion
            })
            .then(tipo => res.status(200).send(tipo))
            .catch(error => res.status(400).send(error))
    },
    list(_, res) {
        return tipo.findAll({
            attributes : ['idTipo',  'descripcion']
        })
            .then(tipo => res.status(200).send(tipo))
            .catch(error => res.status(400).send(error))
    },
    find(req, res) {
        return tipo.findAll({
            where: {
                username: req.params.username,
            }
        })
            .then(tipo => res.status(200).send(tipo))
            .catch(error => res.status(400).send(error))
    },
};
