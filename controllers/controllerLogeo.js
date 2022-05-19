const Sequelize = require('sequelize');
const logeo = require('../models').logeo;
const bcrypt = require('bcryptjs');
module.exports = {
    create(req, res) {
        
        mail_fl = true;
        contrasenia_fl = true;

        if (Object.keys(req.body.mail).length === 0) {
            res.status(400).send({ message: "El mail no puede estar vacio" });
            return mail_fl = false;
        };
        if (Object.keys(req.body.contrasenia).length === 0) {
            res.status(400).send({ message: "La pass no puede estar vacio" });
            return contrasenia_fl = false;
        };
        const isIdUnique = id => db.Profile.findOne({ where: { mail: req.body.mail} })
    .then(token => token !== null)
    .then(isUnique => isUnique);


        if (mail_fl == true && contrasenia_fl == true) {
            return logeo
                .create({
                    mail: req.body.mail,
                    contrasenia: bcrypt.hashSync(req.body.contrasenia, 10)
                })
                .then(logeo => res.status(200).send(logeo))
                .catch(error => res.status(400).send(error))
        } else {
            return res.status(400).send({ message: "Complete los campos" });
        }
        
    },

};
