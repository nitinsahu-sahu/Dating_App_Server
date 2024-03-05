const express = require('express');
const { register, signin, userById, signout } = require('../controllers/authController');
const router = express.Router();


router.get('/users/:userId/:showme', userById)
router.post('/signin', signin)
router.post('/register', register)
router.post('/signout', signout)
// router.post('/editProfile', editProfile)
// router.get('/getProfile', requireSignin, userMiddleware, getProfile)
// router.get('/get-users',  getUsersData)

module.exports = router