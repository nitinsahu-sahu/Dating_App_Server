const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    members: {
        type: Array,
        required: true,
    },
    receiverId: {
        type: String,
    },
    senderId: {
        type: String,
    },
});

const Conversation = mongoose.model('CONVERSATION', conversationSchema);

module.exports = Conversation;