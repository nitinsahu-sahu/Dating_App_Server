const express = require('express');
const cors = require('cors');
const path = require('path');
const io = require('socket.io')(8080, {
    cors: {
        origin: 'http://localhost:3000',
    }
});

// Connect DB
require('./db/connection');

// Import Files
const User = require('./models/Users');
// app Use
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const port = 8000;

// Socket.io
let users = [];
io.on('connection', socket => {
    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await User.findById(senderId);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, fullname: user.fullname, email: user.email }
            });
            }else {
                io.to(sender.socketId).emit('getMessage', {
                    senderId,
                    message,
                    conversationId,
                    receiverId,
                    user: { id: user._id, fullname: user.fullname, email: user.email }
                });
            }
        });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
    // io.emit('getUsers', socket.userId);
});

// Routes
app.get('/', (req, res) => {
    res.send('Welcome');
})

//Customer/User related Routes---------------------------
const authRoutes = require('./view/authRoute')
const chatRoutes = require('./view/messageRoute')
const conversationRoutes = require('./view/conversationRoute')
app.use('/api/v1', authRoutes)
app.use('/api/v1', chatRoutes)
app.use('/api/v1', conversationRoutes)

app.use('/public/',express.static(path.join(__dirname, 'uploads')));
app.listen(port, () => {
    console.log('listening on port ' + port);
})