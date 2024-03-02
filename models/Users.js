const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 20
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    number: {
        type: String,
        trim: true,
        max: 10,
        required: true,
        unique: true,
    },
    gender: {
        type: String,
    },
    showme: {
        type: String,
    },
    dob: {
        type: String,
    },
    intent: {
        type: String,
    },
    role: {
        type: String,
        enum: ['guest', 'administrator'],
        default: 'guest'
    },
    status: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    is_delete: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    tokens: [
        {
            token: {
                type: String,
            }
        }
    ],
    profile: {
        type: String,
        default: "1697700143282-442466333vJtjBQnmAh-default-profile.png"
    },
    pass_word: {
        type: String,
        required: true
    },
    // pics: [
    //     {
    //         img: {
    //             type: String,
    //             default: "1697700143282-442466333vJtjBQnmAh-default-profile.png"
    //         }
    //     }
    // ],

}, { timestamps: true });


//vertual set pwd
userSchema.virtual('password').set(function (password) {
    this.pass_word = bcrypt.hashSync(password, 10)
});
userSchema.methods = {
    authenticate: function (password) {
        return bcrypt.compare(password, this.pass_word)
    }
}

// we are generating generateAuthToken
userSchema.methods.generateAuthToken = async function () {
    try {
        let tokenvar = jwt.sign({ _id: this._id, role: this.role }, process.env.SECRET_KEY, { expiresIn: '1D' });
        this.tokens = this.tokens.concat({ token: tokenvar });
        await this.save();
        return tokenvar;
    } catch (error) {
        res.status(400).json(error.message);
    }
}

const User = mongoose.model('USER', userSchema);
module.exports = User;