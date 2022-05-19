const jwt = require('jwt-simple');
const moment =require('moment');

const checkToken = (req,res,next) => { // si todo va bien, hago next y voy al siguiente manejador derutas

    if (!req.headers['user-token']){
        return res.json({ error: 'Necesitas incluir el token en el header'})
    }

    const userToken = req.headers['user-token'];
    let payload = {};

    try{
        payload = jwt.decode(userToken, 'Frase secreta') // decodifica el token
    }catch(err){
        return res.json({error : 'El token es incorrecto'}); // si se decodifica mal el decode tira un error (por eso el bloque try-catch)
    }

    if(payload.expiredAt < moment.unix()){ // checkeo expiracion del token
        return res.json({ error: 'El token ha expirado' });
    }

    req.usuarioId = payload.usuarioId; // para tener disponible el userId en el enrutador siguiente

    next();
}

module.exports = {
    checkToken : checkToken,
}