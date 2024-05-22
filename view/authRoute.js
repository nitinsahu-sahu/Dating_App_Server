const express = require('express');
const { register, signin, userById, signout, updateInfo, updateprofilepic, unFollow, follow, receiverInfo, signinFB } = require('../controllers/authController');
const router = express.Router();
const path = require('path')
const multer = require('multer');
const { requireSignin } = require('../middleware/auth_middleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), 'uploads'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})
const uploads = multer({ storage })


router.get('/users/:userId/:showme', userById)
router.post('/signin', signin)
router.all('/auth/socialLogin', signinFB)
router.post('/register', register)
router.post('/signout', signout)
router.patch('/update-info/:userId', updateInfo)
router.get('/receiver-data/:id', receiverInfo)
router.post('/follow/:id',requireSignin, follow)
router.post('/unfollow/:id',requireSignin, unFollow)
router.patch('/update-profilepic', uploads.single('profile'), updateprofilepic)
// router.get('/getProfile', requireSignin, userMiddleware, getProfile)
// router.get('/get-users',  getUsersData)

module.exports = router