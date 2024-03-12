const express = require('express');
const { register, signin, userById, signout, updateInfo } = require('../controllers/authController');
const router = express.Router();
const path = require('path')
const multer = require('multer')

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
router.post('/register', register)
router.post('/signout', signout)
router.patch('/update-info/:userId', uploads.single('profile'), updateInfo)
// router.get('/getProfile', requireSignin, userMiddleware, getProfile)
// router.get('/get-users',  getUsersData)

module.exports = router