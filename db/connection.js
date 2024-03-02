const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO_CONN_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('Database connected successfully.')).catch((e)=> console.log('Error', e))


