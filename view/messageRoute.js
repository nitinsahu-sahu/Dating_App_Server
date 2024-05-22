const express = require('express');
const { msgByConversationId, message, uploadFile, getFile, uploadImageFile, deleteForEveryone, deleteMsgForMe } = require('../controllers/messageController');
// const multer = require('multer');
const router = express.Router();
const upload = require('../middleware/multer_middleware') 
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(path.dirname(__dirname), 'uploads'))
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, uniqueSuffix + '-' + file.originalname)
//     }
// })
// const uploads = multer({ storage })

router.get('/message/:conversationId', msgByConversationId)
router.post('/message', message)
router.post('/file/upload', upload.single("file"), uploadFile)
router.post('/file/uploadImage', upload.single("file"), uploadImageFile)
router.get('/file/:filename', getFile)
router.delete('/message/delete/:id', deleteForEveryone)
router.patch('/message/delete/me/', deleteMsgForMe)

module.exports = router