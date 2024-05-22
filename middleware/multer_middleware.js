const multer = require("multer")
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config()

const storage = new GridFsStorage({
    url:process.env.MONGO_CONN_URL,
    options:{
        useNewUrlParser: true, 
        useUnifiedTopology: true
    },
    file: (req, file) => {
        let match = ["image/png", "image/jpg"]
        if (match.indexOf(file.mimetype) === -1) {
            return `${Date.now()}-file-${file.originalname}`
        }
        return {
            bucketName: 'photos',
            filename: `${Date.now()}-file-${file.originalname}`
        }
    }
})
const upload = multer({ storage })
module.exports = upload
