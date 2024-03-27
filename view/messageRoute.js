const express = require('express');
const { msgByConversationId, message, uploadFile, getFile } = require('../controllers/messageController');
const router = express.Router();
const upload = require('../middleware/multer_middleware') 


router.get('/message/:conversationId', msgByConversationId)
router.post('/message', message)
router.post('/file/upload', upload.single("file"), uploadFile)
router.get('/file/:filename',  getFile)

module.exports = router