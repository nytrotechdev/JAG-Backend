const express = require('express');
const router = express.Router();
const userController = require('../controllers/user')
const authMiddleware = require('../middleware/auth');

router.post('/signin', userController.signin);
router.post('/signup', userController.signup);

router.post('/resetpassword', userController.resetpassword);
router.post('/passwordreset/:userid/:token', userController.resetpasswordtoken);

router.post('/updateuser', userController.update);

router.get('/get-created-order',  userController.getcreatedorder);
router.post('/create-order',  userController.createorder);
router.post('/create-order-webhook',  userController.createorderwebhook);

router.post('/update-paid-user',  userController.updatePaidUser);

// router.get('/getuser/:id', userController.getUser);
router.get('/getuser', userController.getUser);

// authMiddleware.auth,

module.exports = router;
