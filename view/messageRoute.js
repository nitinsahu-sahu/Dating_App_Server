const express = require('express');
const { msgByConversationId, message, uploadFile, getFile, uploadImageFile, deleteForEveryone, deleteMsgForMe } = require('../controllers/messageController');
const router = express.Router();
const upload = require('../middleware/multer_middleware') 


router.get('/message/:conversationId', msgByConversationId)
router.post('/message', message)
router.post('/file/upload', upload.single("file"), uploadFile)
router.post('/file/uploadImage', upload.single("file"), uploadImageFile)
router.get('/file/:filename', getFile)
router.delete('/message/delete/:id', deleteForEveryone)
router.patch('/message/delete/me/', deleteMsgForMe)

module.exports = router