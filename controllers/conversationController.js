const User = require('../models/Users')
const Conversation = require('../models/Conversation')

exports.conversationByuserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversation.find({ members: { $in: [userId] } });
        const conversationUserData = Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId);
            const user = await User.findById(receiverId);
            return {
                user: {
                    receiverId: user._id,
                    email: user.email,
                    fullname: user.fullname,
                    profile: user.profile
                },
                conversationId: conversation._id
            }
        }))
        res.status(200).json(await conversationUserData);
    } catch (error) {
        res.status(400).send({ errors: error.message });

    }
}

exports.conversation = async (req, res) => {
    try {
        const {conversationId, senderId, receiverId } = req.body;
        if (conversationId === 'new' && receiverId) {
            const newCoversation = new Conversation(
                {
                    members: [senderId, receiverId],
                    receiverId,
                    senderId
                }
            );
            await newCoversation.save().then(() => {
                res.status(200).send('Conversation created successfully');
            }).catch(() => {
                res.status(400).send('Server error');
            })
        }
    } catch (error) {
        res.status(400).send({ errors: error.message });
    }
}