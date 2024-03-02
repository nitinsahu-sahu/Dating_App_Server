const express = require('express');
const { conversationByuserId, conversation } = require('../controllers/conversationController');
const router = express.Router();


router.get('/conversations/:userId', conversationByuserId)
router.post('/conversation', conversation)

module.exports = router