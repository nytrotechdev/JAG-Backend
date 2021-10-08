const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin')
const authMiddleware = require('../middleware/auth');

router.post('/admin-signin', adminController.adminSignin);
router.post('/admin-signup', adminController.adminSignup);

router.post('/resetpassword', adminController.resetpassword);
router.post('/passwordreset/:userid/:token', adminController.resetpasswordtoken);

router.post('/create-package', adminController.createSubscriptionPackage);
router.put('/update-package',  adminController.updateSubscriptionPackage);
router.get('/get-all-packages',  adminController.getAllSubscriptionPackages);
router.delete('/delete-package',  adminController.deleteSubscriptionPackage);

router.get('/get-all-user', adminController.getAllUser);
// router.get('/getuser/:id', adminController.getUser);
router.post('/update-user',  adminController.updateUser);

// authMiddleware.auth,

module.exports = router;

