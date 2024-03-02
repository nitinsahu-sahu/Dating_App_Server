const express = require('express');
const { msgByConversationId, message } = require('../controllers/messageController');
const router = express.Router();


router.get('/message/:conversationId', msgByConversationId)
router.post('/message', message)

module.exports = router