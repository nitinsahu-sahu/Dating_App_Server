const User = require('../models/Users')
const Conversation = require('../models/Conversation')
const Messages = require('../models/Messages')
const mongoose = require('mongoose')
const grid = require('gridfs-stream')


// ------------------Personal Details Apis------
exports.msgByConversationId = async (req, res) => {
    try {
        const checkMessages = async (conversationId) => {
            const messages = await Messages.find({ conversationId });
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await User.findById(message.senderId);
                return {
                    user: {
                        _id: user._id,
                        email: user.email,
                        fullname: user.fullname,
                        profile: user.profile
                    },
                    msgObj:{
                        _id: message._id,
                        message: message.message,
                        type: message.type,
                    },
                    message: message.message
                }
            }));
            res.status(200).json(await messageUserData);
        }
        const conversationId = req.params.conversationId;
        if (conversationId === 'new') {
            const checkConversation = await Conversation.find(
                {
                    members: {
                        $all: [
                            req.query.senderId,
                            req.query.receiverId
                        ]
                    }
                }
            );
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id);
            } else {
                return res.status(200).json([])
            }
        } else {
            checkMessages(conversationId);
        }
    } catch (error) {
        res.status(400).send({ errors: error.message });
    }
}

exports.message = async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId = '', type } = req.body;
        if (conversationId === 'new' && receiverId) {
            const newCoversation = new Conversation(
                {
                    members: [senderId, receiverId],
                    receiverId,
                    senderId
                }
            );
            await newCoversation.save();
            const newMessage = new Messages(
                {
                    conversationId: newCoversation._id,
                    receiverId,
                    senderId,
                    message,
                    type
                }
            );
            await newMessage.save();
            return res.status(200).send('Message sent successfully');
        } else if (!conversationId && !receiverId) {
            return res.status(400).send({ errors: 'Please fill all required fields' })
        }
        const newMessage = new Messages(
            {
                conversationId, senderId, message, type, receiverId
            }
        );
        await newMessage.save();
        res.status(200).send('Message sent successfully');
    } catch (error) {
        res.status(400).send({ errors: error.message });

    }
}

exports.uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json('File not found')
    }
    const imgUrl = `${process.env.OWN_URL}/file/${req.file.filename}`
    return res.status(200).json(imgUrl)
}

let gfs,gridFsBucket;
const conn = mongoose.connection;
conn.once('open',()=>{
    gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db,{
        bucketName:'fs'
    })
    gfs = grid(conn.db, mongoose.mongo)
    gfs.collection('fs')
})

exports.getFile = async (req, res) => {
    try {
        let file = await gfs.files.findOne({filename: req.params.filename})
        let readStream= gridFsBucket.openDownloadStream(file._id)
        readStream.pipe(res)
    }
    catch (error) {
        return res.status(400).json(error.message)
    }
}