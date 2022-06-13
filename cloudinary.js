const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: 'gsoriano', //process.env.CLOUD_NAME,
    api_key: '838966766312973',//process.env.CLOUDINARY_API_KEY,
    api_secret: 'JJb9sPAzENTJoYtcBDSWqwwGOWU' //process.env.CLOUDINARY_API_SECRET
})

exports.uploads = (file, folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, (result) => {
            resolve({
                url: result.url,
                id: result.public_id
            })
        }, {
            resource_type: "auto",
            folder: folder
        })
    })
}