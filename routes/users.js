const express = require('express');
const router = express.Router();
const userController = require('../controllers/user')
const authMiddleware = require('../middleware/auth');

router.post('/signin', userController.signin);
router.post('/signup', userController.signup);

router.post('/resetpassword', userController.resetpassword);
router.post('/passwordreset/:userid/:token', userController.resetpasswordtoken);

router.post('/updateuser', userController.update);
router.get('/usertype', userController.usertype);


router.get('/get-created-order',  userController.getcreatedorder);
router.post('/create-order',  userController.createorder);
// authMiddleware.auth,

module.exports = router;