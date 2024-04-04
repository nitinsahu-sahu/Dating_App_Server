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
                    type: message.type,
                    updatedAt: message.updatedAt,
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
    let { contentType } = req.body
    if (contentType === 'image') {
        let { filename } = req.file
        let extention = filename.split('.').pop()
        if (extention === 'pdf') {
            return res.status(400).json({ message: "Valid pdf file" })
        } else {
            const imgUrl = `${process.env.OWN_URL}/file/${req.file.filename}`
            return res.status(200).json(imgUrl)
        };
    } else if (contentType === 'pdf') {
        let { filename } = req.file
        let extention = filename.split('.').pop()
        if (extention === 'gif' || extention === 'mp3' || extention === 'mp4' || extention === 'jpg' || extention === 'png' || extention === 'jpeg') {
            return res.status(400).json({ message: "Valid pdf file" })
        } else {
            const imgUrl = `${process.env.OWN_URL}/file/${req.file.filename}`
            return res.status(200).json(imgUrl)
        };

    } else {
        console.log('capture');

    }



}

exports.uploadImageFile = async (req, res) => {
    const imgUrl = `${process.env.OWN_URL}/file/${JSON.stringify(req.body)}`
    return res.status(200).json(imgUrl)
}

let gfs, gridFsBucket;
const conn = mongoose.connection;
conn.once('open', () => {
    gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'fs'
    })
    gfs = grid(conn.db, mongoose.mongo)
    gfs.collection('fs')
})

exports.getFile = async (req, res) => {
    try {
        let file = await gfs.files.findOne({ filename: req.params.filename })
        let readStream = gridFsBucket.openDownloadStream(file._id)
        readStream.pipe(res)
    }
    catch (error) {
        return res.status(400).json(error.message)
    }
}