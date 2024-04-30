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
    senderDeleteStatus: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    receiverDeleteStatus: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    }
}, { timestamps: true });

const Messages = mongoose.model('Message', messageSchema);

module.exports = Messages;