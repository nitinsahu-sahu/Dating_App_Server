const User = require('../models/Users')
const bcrypt = require('bcryptjs');

// ----------------Users by id

exports.userById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const users = await User.find({ _id: { $ne: userId } });
        const usersData = Promise.all(users.map(async (user) => {
            return {
                _id: user._id,
                email: user.email,
                fullname: user.fullname,
                receiverId: user._id,
                profile: user.profile,
            }
        }))
        res.status(200).json(await usersData);
    } catch (error) {
        res.status(400).json({ errors: error.message });
    }
}

// ------------------Register Apis------
exports.register = (req, res) => {
    const { fullname, email, gender, showme, intent, dob, number, password, confirm_pwd } = req.body;
    if (!fullname || !gender || !showme || !intent || !dob || !email || !number || !password || !confirm_pwd) {
        return res.status(400).send({ errors: "plz filled the field properly" });
    }
    User.findOne({ email: email }).then((userExist) => {
        if (userExist) {
            return res.status(400).send({ errors: "Email Already registerd." });
        } else if (password !== confirm_pwd) {
            return res.status(400).send({ errors: "Your password and confirmation password do not match." });
        } else {
            const user = new User({ fullname, email, gender, showme, intent, dob, number, password });
            user.save().then(() => {
                res.status(200).send({ message: "User registerd successfully." });
            }).catch((errors) => res.status(400).send({ errors: errors.message }));
        }
    }).catch((error) => { res.status(400).send({ errors: error.message }) });
}

//Signin controller
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ errors: "Please fill the field properly" });
        }
        const user_info = await User.findOne({ email: email });
        if (user_info && user_info.role === 'guest') {
            const isMatch = await bcrypt.compare(password, user_info.pass_word);
            const token = await user_info.generateAuthToken();
            const user_id = user_info._id;
            res.cookie('user_token', token, { expiresIn: '5h' })
            res.cookie('user_id', user_id, { expiresIn: '5h' })
            const { _id, fullname, email, gender, showme, intent, dob, number, profile } = user_info;
            if (!isMatch) {
                res.status(400).json({ errors: "Invalid email and password." });
            } else {
                res.status(200).json({ _id, token, data: { _id, fullname, email, gender, showme, intent, dob, number, profile }, message: "Signin successfully" });
            }
        } else {
            res.status(400).json({ errors: "User not found." });
        }
    } catch (error) {
        res.status(400).json({ errors: error.message });
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
// ------------------ Edit Personal Details Apis------
// exports.editProfile = (req, res) => {
//     const { fullName, email, gender, showMe, addReleationshipIntent, dob, number } = req.body;
//     let profilePic = [];
//     if (req.files) {
//         profilePic = req.files.map(file => {
//             return { img: file.filename }
//         });
//     }
//     const update = {
//         $set: {
//             fullName, number, email, gender, showMe, addReleationshipIntent, dob, profilePic
//         }
//     }
//     User.findOneAndUpdate({ number: number }, update, {
//         new: true,
//         useFindAndModify: false
//     }).then((data) => {
//         res.status(200).json({ data });
//     }).catch((error) =>
//         res.status(400).send({ errors: error.message })
//     );
// }

// ------------------ Edit Personal Details Apis------
// exports.getProfile = (req, res) => {
//     User.findOne({ _id: req.user._id }).then((data) => {
//         res.status(200).json({ data, message: "Get profile successfully." });
//     }).catch((error) =>
//         res.status(400).send({ errors: error.message })
//     );
// }

// ------------------ Get all users------
// exports.getUsersData = (req, res) => {
//     User.find({}).then((data) => {
//         res.status(200).json({ users: data, message: "Get all users successfully." });
//     }).catch((error) =>
//         res.status(400).send({ errors: error.message })
//     );
// }


// ----------------Login-------------------
// exports.signin = async (req, res) => {
//     try {
//         const { number } = req.body;
//         const user_info = await User.findOne({ number: number });
//         if (user_info && user_info.role === 'guest') {
//             const token = await user_info.generateAuthToken();
//             const user_id = user_info._id;
//             res.cookie('user_token', token, { expiresIn: '5h' })
//             res.cookie('user_id', user_id, { expiresIn: '5h' })
//             const { _id, number, fullName, email, gender, showMe, addReleationshipIntent, dob } = user_info;
//             res.status(200).json({ _id, token, data: { _id, number, fullName, email, gender, showMe, addReleationshipIntent, dob }, message: "Signin successfully" });
//         } else {
//             res.status(400).json({ errors: "User not found." });
//         }
//     } catch (errors) {
//         res.status(400).json(errors.message);
//     }
// }

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