const { Result } = require('express-validator');
const User = require('../models/Users')
const bcrypt = require('bcryptjs');

//--------------------Foollow/unfollow API----------------------//
exports.follow = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = await User.findById(req.user._id);
        if (currentUser.following.includes(user._id)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        currentUser.following.push(user._id);
        user.followers.push(currentUser._id);
        user.save()

        currentUser.save().then((result) => {
            const {
                _id,
                fullname,
                email,
                gender,
                showme,
                intent,
                dob,
                number,
                profile,
                followers,
                following
            } = result;
            res.status(200).json({
                data: {
                    _id,
                    fullname,
                    email,
                    gender,
                    showme,
                    intent,
                    followers,
                    following,
                    dob, number, profile
                }, message: "user following successfully"
            })
        }).catch((error) => {
            res.status(500).json({ message: 'Internal server error' });
        })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};                                                         //                
// -------------------------**********--------------------------//
exports.unFollow = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = await User.findById(req.user._id);
        if (!currentUser.following.includes(user._id)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        currentUser.following.pull(user._id);
        user.followers.pull(currentUser._id);

        await Promise.all([currentUser.save(), user.save()]);

        res.json({ message: 'You have unfollowed this user' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};                                                            //
// --------------***********------------------------------------//
exports.receiverInfo = async (req, res) => {
    try {
        const data = await User.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ message: 'User not found' });
        }
        let details = {
            "_id": data._id,
            "fullname": data.fullname,
            "email": data.email,
            "number": data.number,
            "gender": data.gender,
            "showme": data.showme,
            "dob": data.dob,
            "intent": data.intent,
            "profile": data.profile,
            "followers": data.followers,
            "following": data.following,
        }
        res.status(200).json({
            details,
            message: "Get data successfully."
        });
    } catch (error) {
        res.status(400).send({ errors: error.message });
    }
};
// ---------------------------------------------------
exports.updateInfo = (req, res) => {
    const { fullname, dob, number, gender, showme, intent } = req.body;

    const update = {
        $set: {
            fullname,
            dob,
            number,
            gender,
            showme,
            intent,
        }
    }
    User.findOneAndUpdate({ _id: req.params.userId }, update, {
        new: true,
        useFindAndModify: false
    }).then((data) => {
        res.status(200).json({ updateData: data, message: "Update successfully." });
    }).catch((error) =>
        res.status(400).send({ errors: error.message })
    );
}
// ------------------ Edit Personal Details Apis------
exports.updateInfo = (req, res) => {
    const { fullname, dob, number, gender, showme, intent } = req.body;

    const update = {
        $set: {
            fullname,
            dob,
            number,
            gender,
            showme,
            intent,
        }
    }
    User.findOneAndUpdate({ _id: req.params.userId }, update, {
        new: true,
        useFindAndModify: false
    }).then((data) => {
        res.status(200).json({ updateData: data, message: "Update successfully." });
    }).catch((error) =>
        res.status(400).send({ errors: error.message })
    );
}

exports.updateprofilepic = (req, res) => {
    if (req.file) {
        profile = req.file.filename;
    }
    const update = {
        $set: {
            profile
        }
    }
    User.findOneAndUpdate({ _id: req.body._id }, update, {
        new: true,
        useFindAndModify: false
    }).then((data) => {
        res.status(200).json({ updateData: data, message: "Pic successfully updated..." });
    }).catch((error) =>
        res.status(400).send({ errors: error.message })
    );

}
// ----------------Users by id

exports.userById = async (req, res) => {
    try {
        const { userId, showme } = req.params;
        const users = await User.find({ _id: { $ne: userId } });
        const usersByShowme = users.filter((item) => item.gender === showme)
        const usersData = Promise.all(usersByShowme.map(async (user) => {
            return {
                _id: user._id,
                email: user.email,
                fullname: user.fullname,
                receiverId: user._id,
                profile: user.profile,
                followers: user.followers,
                following: user.following,
            }
        }))
        res.status(200).json(await usersData);
    } catch (error) {
        res.status(400).json({ errors: error.message });
    }
}

// ------------------Register Apis------
exports.register = async (req, res) => {
    try {
        const { fullname, email, gender, showme, intent, dob, number, password, confirm_pwd } = req.body;

        // Check if all required fields are filled properly
        const requiredFields = [fullname, email, gender, showme, intent, dob, number, password, confirm_pwd];
        if (requiredFields.some(field => !field)) {
            return res.status(400).send({ errors: "Please fill in all fields properly" });
        }

        // Check if email is already registered
        const emailExist = await User.findOne({ email: email });
        if (emailExist) {
            return res.status(400).send({ errors: "Email already registered." });
        }

        // Check if mobile number is already registered
        const numberExist = await User.findOne({ number: number });
        if (numberExist) {
            return res.status(400).send({ errors: "Mobile number already registered." });
        }

        // Check if password and confirmation password match
        if (password !== confirm_pwd) {
            return res.status(400).send({ errors: "Your password and confirmation password do not match." });
        }

        // Create new user
        const newUser = new User({ fullname, email, gender, showme, intent, dob, number, password });
        await newUser.save();

        res.status(200).send({ message: "User registered successfully." });
    } catch (error) {
        console.error(error);
        res.status(400).send({ errors: error.message });
    }
};


//Signin controller
exports.signin = async (req, res) => {
    try {
        const { loginId, password } = req.body;
        if (!loginId || !password) {
            return res.status(400).json({ errors: "Please fill the field properly" });
        }
        const user_info = await User.findOne({
            $or: [
                { email: loginId },
                { number: loginId }
            ]
        })
        if (user_info && user_info.role === 'guest') {
            const isMatch = await bcrypt.compare(password, user_info.pass_word);
            const token = await user_info.generateAuthToken();
            const user_id = user_info._id;
            res.cookie('user_token', token, { expiresIn: '5h' })
            res.cookie('user_id', user_id, { expiresIn: '5h' })
            const {
                _id,
                fullname,
                email,
                gender,
                showme,
                intent,
                dob,
                number,
                profile,
                followers,
                following
            } = user_info;
            if (!isMatch) {
                res.status(400).json({ errors: "Invalid email and password." });
            } else {
                res.status(200).json(
                    {
                        _id,
                        token,
                        data: {
                            _id,
                            fullname,
                            email,
                            gender,
                            showme,
                            intent,
                            followers,
                            following,
                            dob, number, profile
                        }, message: "Signin successfully"
                    });
            }
        } else {
            res.status(400).json({ errors: "User not found." });
        }
    } catch (error) {
        res.status(400).json({ errors: "Server mentinance" });
    }
}

//Signin controller
exports.signinFB = async (req, res) => {
    let { credential, email, name, picture, clientId } = req.body

    try {
        const user_info = await User.findOne({ email })
        if (user_info && user_info.role === 'guest') {
            const token = credential;
            const user_id = user_info._id;
            res.cookie('user_token', token, { expiresIn: '5h' })
            res.cookie('user_id', user_id, { expiresIn: '5h' })
            const {
                _id,
                fullname,
                email,
                gender,
                showme,
                intent,
                dob,
                number,
                profile,
                followers,
                following
            } = user_info;
            res.status(200).json(
                {
                    _id,
                    token,
                    data: {
                        _id,
                        fullname,
                        email,
                        gender,
                        showme,
                        intent,
                        followers,
                        following,
                        dob, number, profile
                    }, message: "Signin successfully"
                });
        } else {
            let newUser = new User({ googleToken: credential, fullname: name, email, profile: picture, number: "xxxxx-xxxxx" });
            await newUser.save()
            res.status(200).send({
                _id: clientId,
                token: credential,
                data: {
                    _id: clientId,
                    fullname: name,
                    email,
                    profile: picture,
                    number: "xxxxx-xxxxx"
                },
                message: "User registered successfully."
            });
        }
    } catch (error) {
        res.status(400).json({ errors: "Server mentinance" });
    }
}

// -----------------Logout--------------
exports.signout = async (req, res) => {
    try {
        res.clearCookie('user_token');
        res.clearCookie('user_id');
        res.status(200).json({ message: "Logout successfully." });
    } catch (error) {
        res.status(400).json(error.message);
    }
}


// ----------------Login-------------------
// exports.Googlesignin = async (req, res) => {
//     const firebaseConfig = {
//         apiKey: "AIzaSyAIegrfXNLIh8lEFQZFzT4T83o_3icxbpY",
//         authDomain: "tinder-gbh.firebaseapp.com",
//         projectId: "tinder-gbh",
//         storageBucket: "tinder-gbh.appspot.com",
//         messagingSenderId: "911556713973",
//         appId: "1:911556713973:web:80d55f21d1ced75f1bd4bc"
//     };
//     // Initialize Firebase
//     initializeApp(firebaseConfig);
// }