const Sequelize = require('sequelize');
const logeo = require('../models').logeo;
const usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
module.exports = {

    //creacion de usuario y contraseña
    /* buscoMail(req, res) {
         return mail
             .findAll({
                 attributes: ['mail'],
                 //aca tengo que ir a buscar el codigo
                 where: {
                     mail: req.body.mail
                 }
             }
             )
     },
     buscoAlias(req, res) {
         return logeo
             .findAll({
                 attributes: ['nickname'],
                 where: {
                     nickname: req.body.nickname
                 }
             })
     },*/
   /* logueo(req, res) {
        var resultados= findAll({
            attributes: ['contrasenia'],
            where: {
                mail: req.body.mail
                //,contrasenia: bcrypt.hashSync(req.body.contrasenia, 10)
            }
        })
        .then(res=> 
         bcrypt.compare(req.body.contrasenia, resultados, (error, result) => {
            if (error) {
                console.error('Error: ', error);
            } else {
                console.log('Is the password correct: ', result); // true or false
            }
        })
        )
    },*/
    crearUsuario(req, res) {
        return logeo
            .create({
                mail: req.body.mail,
                contrasenia: bcrypt.hashSync(req.body.contrasenia, 10)
            })
            .then(logeo => res.status(200).send(logeo))
            .catch(error => res.status(400).send(error))
    }
    /*
    
    
        create(req, res) {
            mail_fl = true;
            contrasenia_fl = true;
            //valido que el mail no este vacio
            if (Object.keys(req.body.mail).length === 0) {
                res.status(400).send({ message: "El mail no puede estar vacio" });
                return mail_fl = false;
            };
    
            //valido que la contraseña no este vacia
            if (Object.keys(req.body.contrasenia).length === 0) {
                res.status(400).send({ message: "La pass no puede estar vacio" });
                return contrasenia_fl = false;
            };
            const isIdUnique = id => db.Profile.findOne({ where: { mail: req.body.mail } })
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
    */
};
