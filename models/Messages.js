const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    conversationId: {
        type: String,
    },
    senderId: {
        type: String
    },
    message: {
        type: String
    },
    type: {
        type: String
    },
    receiverId: {
        type: String,
    },
}, { timestamps: true });

const Messages = mongoose.model('Message', messageSchema);

module.exports = Messages;