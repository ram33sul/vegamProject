var express = require('express');
var router = express.Router();
const masterController = require('../controller/masterController');
const userController = require('../controller/userController');
const auth = require('../controller/authentication');

router.get('/', auth.masterLoggedOut, masterController.getLogin);

router.get('/login', auth.masterLoggedOut, masterController.getLogin);

router.post('/login',auth.masterLoggedOut, masterController.postLogin);

router.get('/logout', auth.masterLoggedIn, masterController.logout);

router.get('/home', auth.masterLoggedIn, masterController.home);

router.get('/outlets', auth.masterLoggedIn, masterController.outlets);

router.get('/users', auth.masterLoggedIn, masterController.users);

router.get('/blockUser', auth.masterLoggedIn, masterController.blockUser);

router.get('/unblockUser', auth.masterLoggedIn, masterController.unblockUser);

router.get('/blockOutlet', auth.masterLoggedIn, masterController.blockOutlet);

router.get('/unblockOutlet', auth.masterLoggedIn, masterController.unblockOutlet);

router.get('/userDetails', auth.masterLoggedIn, masterController.getUserDetails);

router.get('/outletDetails', auth.masterLoggedIn, masterController.getOutletDetails);

router.get('/addUser', auth.masterLoggedIn, masterController.getAddUser);

router.get('/userOrders', auth.masterLoggedIn, masterController.getUserOrders);

router.get('/cancelTheOrder', auth.masterLoggedIn, userController.cancelTheOrder);

router.get('/adminOrders', auth.masterLoggedIn, masterController.getAdminOrders);

router.post('/postEditAdmin', auth.masterLoggedIn, masterController.postEditAdmin);

router.post('/postEditUser', auth.masterLoggedIn, masterController.postEditUser);

router.get('/dashboard', auth.masterLoggedIn, masterController.dashboard);

router.post('/postReport', auth.masterLoggedIn, masterController.postReport);

router.get('/report', auth.masterLoggedIn, masterController.getReport);

module.exports = router;